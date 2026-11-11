// src/app/main.js
// Entry point: main() starts the app.
//
// Defines: isSafariBrowser, isSafari, main
// Uses from other files:
//   app/ui/modal.js: defaultModalButtons, closeModal, Modal
//   app/renderer/ffl-resources.js: loadFFLResources, getFFLResourcesPromise, waitForFFLResources
//   app/setup/first-run.js: skipFirstRunSetup, runFirstRunSetup, finishFirstRunSetup
//   app/settings/settings-dialog.js: applySettings, openSettingsDialog
//   app/library/library.js: getRefreshLibrary, openLibrary
//   app/ui/html.js: Html
//   app/audio/music.js: getMusicPlayer
//   app/audio/sound-effects.js: getSoundEffects
//   app/util/colors-and-bytes.js: decodeHexOrBase64
//   app/mii/mii.js: Mii
//   app/util/platform.js: MB
//   app/settings/settings.js: getSetting
//   … and 3 more files

var isSafariBrowser = !1,
  isSafari = () => isSafariBrowser;
async function main() {
  if (/Mobi/.test(navigator.userAgent)) document.documentElement.style.zoom = "0.8";
  await MB();
  let e = getMusicPlayer(),
    t = new URLSearchParams(location.search),
    r = t.has("select") ? !1 : !0,
    n = await localforage.default.getItem("settings_tutorialClear");
  (e.initMusic(n, !n), getSoundEffects());
  let i = !1;
  setInterval(() => {
    fetch("/api/session")
      .then((h) => {
        if (!h.ok) o();
      })
      .catch((h) => {
        o();
      });
  }, 45000);
  async function o() {
    if (i) return;
    if (((i = !0), getRefreshLibrary()(), MiiEditor.getCurrentEditor())) MiiEditor.getCurrentEditor()?.shutdown(!1, !1);
    if (
      (document.querySelectorAll(".modal").forEach((h) => {
        closeModal(Html.from(h));
      }),
      Modal.modal(
        translate("Warning"),
        translate("Mii Creator has lost connection to the server. Click OK to reload."),
        "body",
        {
          text: "OK",
          callback(h) {
            location.reload();
          },
        },
      ),
      e.mainGainNode.gain.setValueAtTime(e.mainGainNode.gain.value, getMusicPlayer().audioContext.currentTime),
      e.editGainNode)
    )
      e.editGainNode.gain.setValueAtTime(e.editGainNode.gain.value, getMusicPlayer().audioContext.currentTime);
    if (
      (e.mainGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + 5),
      e.editGainNode)
    )
      e.editGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + 5);
  }
  if (!n)
    (localforage.default.setItem("settings_theme", "sw2"),
      localforage.default.setItem("settings_bgmType", "auto"),
      localforage.default.setItem("settings_sfxType", "auto"));
  if ((await applySettings(!0), !n)) await skipFirstRunSetup().then(() => {});
  (loadFFLResources(r, !0),
    getFFLResourcesPromise().catch((h) => {
      throw (
        Modal.modal(
          "Error",
          `Oops, an error occurred when loading Mii Creator..

Loading will not continue.`,
        )
          .qs(".modal-body")
          .appendMany(
            new Html("pre").style({ margin: "0", overflow: "auto", padding: "20px 0" }).text(h.stack),
            new Html("span").html(
              `If the error persists, please report this to the developer <a href="mailto:datkat21.yt@gmail.com">kat21's e-mail</a>!`,
            ),
            new Html("span").text("Or, you can try to reset your settings."),
            new Html("button")
              .class("danger")
              .text("Reset Settings")
              .on("click", async () => {
                if (
                  !(await Modal.prompt(
                    translate("Warning"),
                    translate("Are you sure you want to delete your settings? The page will reload."),
                    "body",
                    !0,
                  ))
                )
                  return;
                (localforage.default.clear(), location.reload());
              }),
          ),
        h
      );
    }));
  let s = Modal.modal(translate("Notice"), translate("Loading Mii Creator")),
    a = new Html("span").text(translate("Loading assets..."));
  (s.qs(".modal-body").append(a),
    await waitForFFLResources(),
    setTimeout(() => {
      closeModal(s);
    }, 500));
  function l() {
    if (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1)
      (Modal.modal(
        translate("Warning"),
        translate(
          "You're using Mii Creator under Safari. Safari on iOS or iPadOS may experience instability with Mii Creator, causing the page to crash and refresh randomly. Some checks have been enabled to try and prevent the page from crashing right now. You have been warned.",
        ),
        "body",
        ...defaultModalButtons(),
      ),
        (isSafariBrowser = !0));
  }
  if (navigator.userAgent.indexOf("Safari") != -1 && navigator.userAgent.indexOf("Chrome") == -1)
    window.browserMitigations = !0;
  let c = "main";
  (document.addEventListener("editor-launch", () => {
    ((c = "edit"),
      setTimeout(() => {
        u();
      }, 100));
  }),
    document.addEventListener("editor-shutdown", () => {
      ((c = "main"),
        setTimeout(() => {
          u();
        }, 100));
    }));
  function u() {
    if (e.editGainNode === void 0) return;
    let h = 3.5;
    if (e.theme === "wiiu") h = 1;
    if (e.theme === "wii" || e.curTheme === "wii" || e.theme === "3ds" || e.curTheme === "3ds") {
      if (((h = 1), c === "main"))
        (e.mainGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
          e.editGainNode.gain.setValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime),
          e.mainGainNode.gain.linearRampToValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime + h),
          e.editGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + h));
      if (c === "edit")
        (e.mainGainNode.gain.setValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime),
          e.editGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
          e.mainGainNode.gain.linearRampToValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime + h),
          e.editGainNode.gain.linearRampToValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime + h));
      return;
    }
    if (e.theme === "miitomo" || e.curTheme === "miitomo") h = 0.5;
    if (c === "main")
      (e.mainGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
        e.editGainNode.gain.setValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime),
        e.mainGainNode.gain.linearRampToValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime + h),
        e.editGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + h));
    if (c === "edit")
      (e.mainGainNode.gain.setValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime),
        e.editGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
        e.mainGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + h),
        e.editGainNode.gain.linearRampToValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime + h));
  }
  let d = sessionStorage.getItem("loc");
  if (d !== null) {
    let h = new URLSearchParams(d);
    if (h.has("to")) {
      let f = h.get("to");
      if (f === "/") return;
      (sessionStorage.removeItem("loc"), (location.href = f));
    }
  }
  if (
    (l(),
    getSoundEffects().setVolume(0.28),
    e.setVolume(0.28),
    window.addEventListener("blur", () => {
      getSetting("bgmLoseFocus").then((h) => {
        if (h === !1) return;
        if (e.mainGainNode)
          if (e.editGainNode) {
            if (e.theme === "wii") {
              if (c === "main")
                (e.mainGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
                  e.editGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
                  e.mainGainNode.gain.linearRampToValueAtTime(
                    -0.6,
                    getMusicPlayer().audioContext.currentTime + 0.5,
                  ),
                  e.editGainNode.gain.linearRampToValueAtTime(
                    -1,
                    getMusicPlayer().audioContext.currentTime + 0.5,
                  ));
              if (c === "edit")
                (e.mainGainNode.gain.setValueAtTime(-0.6, getMusicPlayer().audioContext.currentTime),
                  e.editGainNode.gain.setValueAtTime(-1, getMusicPlayer().audioContext.currentTime),
                  e.mainGainNode.gain.linearRampToValueAtTime(
                    -0.6,
                    getMusicPlayer().audioContext.currentTime + 0.5,
                  ),
                  e.editGainNode.gain.linearRampToValueAtTime(
                    -0.6,
                    getMusicPlayer().audioContext.currentTime + 0.5,
                  ));
              return;
            }
            if (c === "main")
              (e.mainGainNode.gain.linearRampToValueAtTime(
                -0.8,
                getMusicPlayer().audioContext.currentTime + 0.5,
              ),
                e.editGainNode.gain.linearRampToValueAtTime(
                  -1,
                  getMusicPlayer().audioContext.currentTime + 0.5,
                ));
            else if (c === "edit")
              (e.mainGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + 0.5),
                e.editGainNode.gain.linearRampToValueAtTime(
                  -0.8,
                  getMusicPlayer().audioContext.currentTime + 0.5,
                ));
          } else
            e.mainGainNode.gain.linearRampToValueAtTime(-1, getMusicPlayer().audioContext.currentTime + 0.5);
        else getMusicPlayer().setVolume(0);
        getSoundEffects().setVolume(0);
      });
    }),
    window.addEventListener("focus", () => {
      getSetting("bgmLoseFocus").then((h) => {
        if (h === !1) return;
        if (e.mainGainNode) {
          if (c === "main")
            (e.mainGainNode.gain.setValueAtTime(-1, e.audioContext.currentTime),
              e.mainGainNode.gain.linearRampToValueAtTime(
                -0.6,
                getMusicPlayer().audioContext.currentTime + 0.5,
              ));
          else if (c === "edit")
            if (e.editGainNode)
              (e.editGainNode.gain.setValueAtTime(-1, e.audioContext.currentTime),
                e.editGainNode.gain.linearRampToValueAtTime(
                  -0.6,
                  getMusicPlayer().audioContext.currentTime + 0.5,
                ));
            else
              (e.mainGainNode.gain.setValueAtTime(-1, e.audioContext.currentTime),
                e.mainGainNode.gain.linearRampToValueAtTime(
                  -0.6,
                  getMusicPlayer().audioContext.currentTime + 0.5,
                ));
        } else getMusicPlayer().setVolume(0);
        getSoundEffects().setVolume(getSoundEffects().previousVolume);
      });
    }),
    !n)
  )
    (await runFirstRunSetup(), finishFirstRunSetup().then(() => {}));
  else if (location.search !== "")
    if (t.has("data"))
      (await waitForFFLResources(),
        new MiiEditor(
          0,
          async (h, f) => {
            if (window.parent !== window.self) {
              let p = new Mii(h),
                g = null,
                m = null,
                A = null;
              if (f === !0) {
                if (t.has("renderTypes")) {
                  let y = t.get("renderTypes").split(",");
                }
              }
              (e.mainGainNode.gain.linearRampToValueAtTime(-1, e.audioContext.currentTime + 0.5),
                window.opener.postMessage(
                  {
                    type: "miic-data-finalize",
                    properSave: f,
                    data: h,
                    name: p.nickname,
                    creator: p.creator,
                    headshot: g,
                    headOnly: m,
                    fullBody: A,
                  },
                  t.get("origin"),
                ));
            } else openLibrary();
          },
          t.get("data"),
        ));
    else if (t.has("select")) {
      let { miiData: h, mii: f } = await openLibrary(void 0, !0);
      (window.opener.postMessage(
        { type: "miic-select", data: f, modelData: f.exportHex("studioData"), name: h.nickname, creator: h.creator },
        "*",
      ),
        close());
    } else if (t.has("add-mii")) {
      let h = new Mii(decodeHexOrBase64(t.get("add-mii"))),
        f = translate("Mii Creator");
      (await waitForFFLResources(),
        cv(h, f, translate("You got sent a Mii!"), !0).then(() => {
          (Modal.modal(
            translate("Done"),
            translate("You can now close this tab, or continue using Mii Creator."),
            "body",
            {
              text: "Visit my Mii Library",
              callback(p) {
                openLibrary();
              },
            },
          ),
            window.close());
        }));
      return;
    } else if (t.has("settings")) openSettingsDialog();
    else if (t.has("custom-render")) {
      await waitForFFLResources();
      let h = t.get("custom-render"),
        f = new Mii(h);
      openCustomRenderDialog(f);
    } else openLibrary();
  else openLibrary();
}
var localforage = In(Hs(), 1);
document.documentElement.dataset.theme = "sw2";
window.localforage = localforage.default;
main();
