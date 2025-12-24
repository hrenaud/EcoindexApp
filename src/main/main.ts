import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    BrowserWindow,
    Menu,
    MenuItemConstructorOptions,
    app,
    ipcMain,
} from 'electron'
import log from 'electron-log'
import Store from 'electron-store'
import { setMainWindow } from './memory'
import { initialization } from './handlers/Initalization'

// Configuration de electron-log
log.initialize()
log.transports.file.level = 'debug' // Toujours en debug pour les fichiers
log.transports.console.level = 'debug' // Toujours en debug pour la console
log.transports.file.maxSize = 5 * 1024 * 1024 // 5MB
console.log(
    'electron-log initialized, file:',
    log.transports.file.getFile().path
)

export const getMainLog = () => {
    return log
}

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

// Fonction pour obtenir le chemin des ressources (extraResources)
// En développement : utilise APP_ROOT/src/extraResources
// En production : utilise process.resourcesPath
export const getResourcesPath = () => {
    if (app.isPackaged && process.resourcesPath) {
        return process.resourcesPath
    }
    // En développement, utiliser le chemin du projet
    return path.join(APP_ROOT, 'src', 'extraResources')
}

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

// Store pour persister les préférences
const store = new Store({
    defaults: {
        language: 'en',
    },
})

// Fonction pour créer le menu avec le sélecteur de langue
function createMenu() {
    const currentLang = (store.get('language') as string) || 'en'

    const template: MenuItemConstructorOptions[] = [
        {
            label: process.platform === 'darwin' ? app.getName() : 'File',
            submenu: [
                {
                    role: 'quit',
                },
            ],
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Language',
                    submenu: [
                        {
                            label: 'Français',
                            type: 'radio',
                            checked: currentLang === 'fr',
                            click: () => changeLanguage('fr'),
                        },
                        {
                            label: 'English',
                            type: 'radio',
                            checked: currentLang === 'en',
                            click: () => changeLanguage('en'),
                        },
                    ],
                },
                { type: 'separator' },
                {
                    role: 'reload',
                },
                {
                    role: 'forceReload',
                },
                {
                    role: 'toggleDevTools',
                },
                { type: 'separator' },
                {
                    role: 'resetZoom',
                },
                {
                    role: 'zoomIn',
                },
                {
                    role: 'zoomOut',
                },
                { type: 'separator' },
                {
                    role: 'togglefullscreen',
                },
            ],
        },
    ]

    // Sur macOS, ajouter le menu standard
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
            ],
        })
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

// Fonction pour changer la langue
function changeLanguage(lang: string) {
    // Sauvegarder la langue dans le store (comme dans l'ancienne application)
    store.set('language', lang)
    // Notifier toutes les fenêtres
    BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('language-changed', lang)
    })
    // Reconstruire le menu avec la nouvelle langue sélectionnée
    createMenu()
}

// Handlers IPC pour la communication avec le renderer
ipcMain.handle('change-language', (_event, lang: string) => {
    changeLanguage(lang)
})

ipcMain.handle('get-language', () => {
    return store.get('language') || 'en'
})

// Handlers IPC pour l'API store générique (comme dans l'ancienne application)
ipcMain.handle('store-set', (_event, key: string, value: unknown) => {
    store.set(key, value)
})

ipcMain.handle('store-get', (_event, key: string, defaultValue?: unknown) => {
    return store.get(key, defaultValue)
})

ipcMain.handle('store-delete', (_event, key: string) => {
    store.delete(key as any)
})

// Handler IPC pour l'initialisation (pour compatibilité avec l'ancien code)
ipcMain.handle(
    'initialization-app',
    async (_event, forceInitialisation = false) => {
        return await initialization(_event, forceInitialisation)
    }
)

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
    setMainWindow(win)

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
        const mainLog = getMainLog()
        mainLog.info('Window did-finish-load event fired')
        console.log('Window did-finish-load event fired')
        win?.webContents.send(
            'main-process-message',
            new Date().toLocaleString()
        )

        // Lancer l'initialisation automatiquement depuis le main process
        // Attendre un peu pour que la fenêtre soit complètement chargée
        setTimeout(async () => {
            mainLog.info(
                'Starting automatic initialization from main process...'
            )
            console.log(
                'Starting automatic initialization from main process...'
            )
            try {
                // Créer un event factice pour l'initialisation
                const fakeEvent = {
                    sender: win?.webContents,
                } as any
                mainLog.debug('Calling initialization function...')
                console.log('Calling initialization function...')
                const result = await initialization(fakeEvent, false)
                mainLog.info('Initialization completed with result:', result)
                console.log('Initialization completed with result:', result)
            } catch (error) {
                mainLog.error('Error during automatic initialization:', error)
                console.error('Error during automatic initialization:', error)
                if (error instanceof Error) {
                    mainLog.error('Error stack:', error.stack)
                    console.error('Error stack:', error.stack)
                }
            }
        }, 1000)
    })

    // Handle errors
    win.webContents.on(
        'did-fail-load',
        (_event, errorCode, errorDescription) => {
            console.error('Failed to load:', errorCode, errorDescription)
        }
    )
}

app.whenReady().then(() => {
    createMenu()
    createWindow()
})

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
