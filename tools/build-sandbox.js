#!/usr/bin/env node
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
function buildSandbox(outFile = path.join(ROOT, "public/dist/sandbox-renderer.js")) {
  const manifest = JSON.parse(fs.readFileSync(path.join(SRC, "manifest.json"), "utf8"));
  const files = manifest.files.filter(({ file }) => file !== "app/main.js");
  files.push({ file: "app/sandbox-renderer-bridge.js" });
  const parts = ["// Native Mii renderer bundle for the 3D sandbox.\n"];
  for (const { file } of files) {
    let code = fs.readFileSync(path.join(SRC, file), "utf8");
    code = code.replace(/includeGLSL\("([^"]+)"\)/g, (_, p) => JSON.stringify(readInclude("shaders", p, file)));
    code = code.replace(/includeJSON\("([^"]+)"\)/g, (_, p) => {
      const value = readInclude("data", p, file);
      JSON.parse(value);
      return value.trim();
    });
    parts.push("\n//#region src/" + file + "\n" + code.replace(/\s+$/, "") + "\n//#endregion\n");
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, parts.join(""));
  return { files: files.length, bytes: parts.join("").length, outFile };
}
function readInclude(dir, file, from) {
  const root = path.join(SRC, dir);
  const full = path.join(root, file);
  if (!full.startsWith(root + path.sep)) throw new Error(from + ": invalid include " + file);
  return fs.readFileSync(full, "utf8");
}
module.exports = { buildSandbox };
if (require.main === module) {
  const result = buildSandbox();
  console.log("[sandbox build] " + result.files + " source files -> " + result.outFile);
}
