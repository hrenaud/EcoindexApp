import { app as e, BrowserWindow as c } from "electron";
import { fileURLToPath as f } from "node:url";
import { createRequire as w } from "node:module";
import n from "node:path";
const m = w(import.meta.url);
try {
  m("electron-squirrel-startup") && e.quit();
} catch {
}
const d = n.dirname(f(import.meta.url)), g = () => e.isPackaged ? e.getAppPath() : n.join(d, "../.."), t = g();
process.env.APP_ROOT = t;
const s = process.env.VITE_DEV_SERVER_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5173" : void 0), P = n.join(t, "dist-electron"), u = n.join(t, "dist"), A = n.join(t, "dist"), l = e.isPackaged ? n.join(t, ".vite", "renderer", "main_window", "index.html") : n.join(t, "dist", "index.html"), h = s ? n.join(t, "public") : u;
process.platform === "win32" && e.disableHardwareAcceleration();
process.platform === "win32" && e.setAppUserModelId(e.getName());
e.requestSingleInstanceLock() || (e.quit(), process.exit(0));
let o = null;
const R = n.join(d, "preload.js");
async function p() {
  o = new c({
    title: "EcoindexApp",
    icon: n.join(h, "favicon.ico"),
    width: 1200,
    height: 800,
    webPreferences: {
      preload: R,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), s ? (console.log("Loading from Vite dev server:", s), o.loadURL(s), o.webContents.openDevTools()) : (console.log("Loading from file:", l), console.log("App path:", e.getAppPath()), console.log("Is packaged:", e.isPackaged), o.loadFile(l)), o.webContents.on("did-finish-load", () => {
    o?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), o.webContents.on("did-fail-load", (i, r, a) => {
    console.error("Failed to load:", r, a);
  });
}
e.whenReady().then(p);
e.on("window-all-closed", () => {
  o = null, process.platform !== "darwin" && e.quit();
});
e.on("second-instance", () => {
  o && (o.isMinimized() && o.restore(), o.focus());
});
e.on("activate", () => {
  const i = c.getAllWindows();
  i.length ? i[0].focus() : p();
});
e.on("browser-window-created", (i, r) => {
  r.webContents.setWindowOpenHandler(({ url: a }) => a.startsWith("https:") ? { action: "deny" } : { action: "allow" });
});
export {
  A as DIST,
  P as MAIN_DIST,
  u as RENDERER_DIST,
  l as RENDERER_HTML,
  s as VITE_DEV_SERVER_URL,
  h as VITE_PUBLIC
};
