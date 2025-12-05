import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import path from "node:path";
const require$1 = createRequire(import.meta.url);
try {
  if (require$1("electron-squirrel-startup")) {
    app.quit();
  }
} catch (error) {
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
const getAppRoot = () => {
  if (app.isPackaged) {
    return app.getAppPath();
  }
  return path.join(__dirname$1, "../..");
};
const APP_ROOT = getAppRoot();
process.env.APP_ROOT = APP_ROOT;
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5173" : void 0);
const MAIN_DIST = path.join(APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(APP_ROOT, "dist");
const DIST = path.join(APP_ROOT, "dist");
const RENDERER_HTML = app.isPackaged ? path.join(APP_ROOT, ".vite", "renderer", "main_window", "index.html") : path.join(APP_ROOT, "dist", "index.html");
const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, "public") : RENDERER_DIST;
if (process.platform === "win32") app.disableHardwareAcceleration();
if (process.platform === "win32") app.setAppUserModelId(app.getName());
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
let win = null;
const preload = path.join(__dirname$1, "preload.js");
async function createWindow() {
  win = new BrowserWindow({
    title: "EcoindexApp",
    icon: path.join(VITE_PUBLIC, "favicon.ico"),
    width: 1200,
    height: 800,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  if (VITE_DEV_SERVER_URL) {
    console.log("Loading from Vite dev server:", VITE_DEV_SERVER_URL);
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    console.log("Loading from file:", RENDERER_HTML);
    console.log("App path:", app.getAppPath());
    console.log("Is packaged:", app.isPackaged);
    win.loadFile(RENDERER_HTML);
  }
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("Failed to load:", errorCode, errorDescription);
  });
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});
app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
app.on("browser-window-created", (_, window) => {
  window.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:")) {
      return { action: "deny" };
    }
    return { action: "allow" };
  });
});
export {
  DIST,
  MAIN_DIST,
  RENDERER_DIST,
  RENDERER_HTML,
  VITE_DEV_SERVER_URL,
  VITE_PUBLIC
};
