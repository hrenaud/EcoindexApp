import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { app, BrowserWindow } from 'electron'

const require = createRequire(import.meta.url)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// Utiliser try-catch car le module peut ne pas être disponible en production
try {
    if (require('electron-squirrel-startup')) {
        app.quit()
    }
} catch {
    // Le module n'est pas disponible, continuer normalement
    // C'est normal sur macOS/Linux où ce module n'est pas nécessaire
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
// En développement, utiliser __dirname, en production utiliser app.getAppPath()
const getAppRoot = () => {
    if (app.isPackaged) {
        return app.getAppPath()
    }
    return path.join(__dirname, '../..')
}

// Initialiser APP_ROOT après que app soit disponible
const APP_ROOT = getAppRoot()
process.env.APP_ROOT = APP_ROOT

// Get VITE_DEV_SERVER_URL from environment, with fallback
const VITE_DEV_SERVER_URL =
    process.env.VITE_DEV_SERVER_URL ||
    (process.env.NODE_ENV === 'development'
        ? 'http://localhost:5173'
        : undefined)

export { VITE_DEV_SERVER_URL }
export const MAIN_DIST = path.join(APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(APP_ROOT, 'dist')
export const DIST = path.join(APP_ROOT, 'dist')
// En production avec Electron Forge Vite, le renderer est dans .vite/renderer/main_window
export const RENDERER_HTML = app.isPackaged
    ? path.join(APP_ROOT, '.vite', 'renderer', 'main_window', 'index.html')
    : path.join(APP_ROOT, 'dist', 'index.html')
export const VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(APP_ROOT, 'public')
    : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (process.platform === 'win32') app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = path.join(__dirname, 'preload.js')

async function createWindow() {
    win = new BrowserWindow({
        title: 'EcoindexApp',
        icon: path.join(VITE_PUBLIC, 'favicon.ico'),
        width: 1200,
        height: 800,
        webPreferences: {
            preload,
            // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
            // Consider using contextBridge.exposeInMainWorld
            // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
            nodeIntegration: false,
            contextIsolation: true,
        },
    })

    // In development, always try to load from Vite dev server first
    if (VITE_DEV_SERVER_URL) {
        console.log('Loading from Vite dev server:', VITE_DEV_SERVER_URL)
        win.loadURL(VITE_DEV_SERVER_URL)
        // Open devTool if the app is not packaged
        win.webContents.openDevTools()
    } else {
        console.log('Loading from file:', RENDERER_HTML)
        console.log('App path:', app.getAppPath())
        console.log('Is packaged:', app.isPackaged)
        win.loadFile(RENDERER_HTML)
    }

    // Test actively push message to the Electron-Renderer
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send(
            'main-process-message',
            new Date().toLocaleString()
        )
    })

    // Handle errors
    win.webContents.on(
        'did-fail-load',
        (event, errorCode, errorDescription) => {
            console.error('Failed to load:', errorCode, errorDescription)
        }
    )
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    win = null
    if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
    if (win) {
        // Focus on the main window if the user tried to open another
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    } else {
        createWindow()
    }
})

// New window example arg: new windows url
app.on('browser-window-created', (_, window) => {
    window.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('https:')) {
            // shell.openExternal(url);
            return { action: 'deny' }
        }
        return { action: 'allow' }
    })
})
