#!/usr/bin/env node
/*
 * Builds a static copy of the site for GitHub Pages (or any static host) in dist-static/.
 *
 *   node tools/build-static.js [--out=dist-static] [--base=/MiiCreator]
 *
 * GitHub Pages can't run server.js, so this:
 *  - builds public/dist/main.js from src/ (tools/build.js) and copies public/;
 *  - adds a browser copy of the /api emulator (lib/api-core.js) to every page: /api/* is answered
 *    in the browser and each visitor's library lives in their own browser (localStorage);
 *  - adds the debug flags from config/debug-flags.json, like server.js does;
 *  - with a base path (BASE_PATH or --base, e.g. "/MiiCreator" for https://<user>.github.io/MiiCreator/),
 *    rewrites root-absolute links (/assets, /dist, /app…) to start with it;
 *  - publishes app/index.html as app.html so /app works without a trailing slash (page-relative
 *    URLs like "assets/…" then resolve the same way as on the original site);
 *  - writes 404.html (a copy of index.html) for client-side routes and .nojekyll.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { build } = require("./build");
const { buildSandbox } = require("./build-sandbox");
const { enabledFlags, injectIntoHead, flagScript } = require("../lib/debug-flags");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");
const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [a, true]; }));
const OUT = path.resolve(ROOT, arg.out || process.env.OUT_DIR || "dist-static");
const BASE = String(arg.base || process.env.BASE_PATH || "").replace(/\/+$/, "").replace(/^(?=[^/])/, "/");

// ---------- browser /api emulator ----------
const apiCore = fs.readFileSync(path.join(ROOT, "lib/api-core.js"), "utf8")
  .replace(/\(function \(root, factory\) \{[\s\S]*?\}\)\(typeof self[^,]*, function \(\) \{/, "var MiiCreatorApiCore = (function () {")
  .replace(/\}\);\s*$/, "})();\n");
if (!apiCore.includes("var MiiCreatorApiCore = (function () {")) throw new Error("Could not unwrap lib/api-core.js");

const apiShim = `/* static /api emulator (tools/build-static.js) */(function () {
"use strict";
var BASE = ${JSON.stringify(BASE)};
${apiCore}
var KEY = "miicreator-static-db", mem = null;
var store = {
  load: function () { try { var s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {} return mem; },
  save: function (db) { mem = db; try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { console.warn("[static api] could not save to localStorage", e); } }
};
var api = MiiCreatorApiCore.createApi(store);
window.__miicStaticApi = api; // from the console: __miicStaticApi.getDb() / .replaceDb(obj)
var realFetch = window.fetch.bind(window);
window.fetch = function (input, init) {
  var url;
  try { url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href); }
  catch (e) { return realFetch(input, init); }
  if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return realFetch(input, init);
  if (!/^\\/api(\\/|$)/.test(url.pathname)) {
    // safety net for root paths built at runtime that the build didn't rewrite
    if (BASE && url.pathname.indexOf(BASE + "/") !== 0 && typeof input === "string" && /^\\/(?!\\/)/.test(input)) return realFetch(BASE + url.pathname + url.search, init);
    return realFetch(input, init);
  }
  var method = (init && init.method) || (input && input.method) || "GET";
  var bodyP = init && init.body != null ? Promise.resolve(init.body) : input && typeof input === "object" && input.text ? input.clone().text() : Promise.resolve("");
  return bodyP.then(function (raw) {
    var body = {};
    if (typeof raw === "string" && raw) { try { body = JSON.parse(raw); } catch (e) { body = {}; } }
    var r;
    try { r = api.handle({ method: method, path: url.pathname, query: url.searchParams, body: body }); }
    catch (e) { r = { status: 500, body: { error: true, message: String((e && e.message) || e) } }; }
    return new Response(JSON.stringify(r.body), { status: r.status, headers: { "content-type": "application/json" } });
  });
};
})();`;

// ---------- base path rewriting ----------
const SEG = "assets|dist|app|about|contact|terms|privacypolicy|login|logout|FFLRes\\w*|cdn-cgi|auth";
const segRe = new RegExp("([\"'`(=])\\/(?=(?:" + SEG + ")(?![\\w-]))", "g");
function rebase(s) {
  if (!BASE) return s;
  return s
    .replace(segRe, "$1" + BASE + "/")
    // main.js's public-folder root, used for dist/brotli-wasm.js and the model bundles
    .replace(/(var\s+PUBLIC_ROOT\s*=\s*)"\/"/, (m, a) => a + JSON.stringify(BASE + "/"))
    .replace(/(location\.href\s*=\s*)(["'`])\/\2/g, "$1$2" + BASE + "/$2")
    .replace(/(\shref=)(["'])\/\2/g, "$1$2" + BASE + "/$2");
}
// page-relative "dist/…"/"assets/…" links in nested pages -> absolute
const fixRelative = (s) => s.replace(/(\s(?:src|href)=)(["'])(?=(?:dist|assets)\/)/g, "$1$2/");

// ---------- build ----------
const r = build(path.join(PUBLIC, "dist/main.js"));
const sandboxBuild = buildSandbox(path.join(PUBLIC, "dist/sandbox-renderer.js"));
console.log(`[sandbox build] ${sandboxBuild.files} source files`);
console.log(`[build] main.js from ${r.files} source files`);

fs.rmSync(OUT, { recursive: true, force: true });
const flags = enabledFlags(PUBLIC);
const scripts = [flagScript(flags), apiShim].filter(Boolean);
let count = 0, bytes = 0;
(function copy(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const src = path.join(dir, e.name), rel = path.relative(PUBLIC, src).split(path.sep).join("/");
    if (e.isDirectory()) { copy(src); continue; }
    let buf = fs.readFileSync(src);
    if (/\.(html?|m?js|css)$/i.test(rel)) {
      let s = buf.toString("utf8");
      if (/\.html?$/i.test(rel)) { if (rel.includes("/")) s = fixRelative(s); s = injectIntoHead(s, scripts); }
      s = rebase(s);
      buf = Buffer.from(s);
    }
    const dest = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, buf);
    count++; bytes += buf.length;
    if (buf.length > 100 * 1024 * 1024) console.warn(`[build] ${rel} is over 100 MB — GitHub won't accept it`);
  }
})(PUBLIC);
// a folder holding only index.html (app/) becomes app.html, served at /app like the original site
for (const e of fs.readdirSync(OUT, { withFileTypes: true })) {
  const d = path.join(OUT, e.name);
  if (e.isDirectory() && fs.readdirSync(d).join() === "index.html" && !fs.existsSync(d + ".html")) {
    fs.renameSync(path.join(d, "index.html"), d + ".html"); fs.rmdirSync(d);
  }
}
fs.copyFileSync(path.join(OUT, "index.html"), path.join(OUT, "404.html"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
if (process.env.PAGES_CNAME) fs.writeFileSync(path.join(OUT, "CNAME"), process.env.PAGES_CNAME.trim() + "\n");
console.log(`[build] ${count} files (${(bytes / 1048576).toFixed(1)} MB) -> ${path.relative(process.cwd(), OUT) || "."}`);
console.log(`[build] base path: ${BASE || "/ (domain root)"} | debug flags: ${flags.join(", ") || "none"}`);
