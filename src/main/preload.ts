import { contextBridge, ipcRenderer } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args
        return ipcRenderer.on(channel, (event, ...args) =>
            listener(event, ...args)
        )
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...omit] = args
        return ipcRenderer.off(channel, ...omit)
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...omit] = args
        return ipcRenderer.send(channel, ...omit)
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...omit] = args
        return ipcRenderer.invoke(channel, ...omit)
    },
    // You can expose other APTs for the renderer process here
})

// --------- Expose language API and Linux update API ---------
contextBridge.exposeInMainWorld('electronAPI', {
    changeLanguage: (lang: string) =>
        ipcRenderer.invoke('change-language', lang),
    getLanguage: () => ipcRenderer.invoke('get-language'),
    onLanguageChanged: (callback: (lang: string) => void) => {
        ipcRenderer.on('language-changed', (_event, lang: string) =>
            callback(lang)
        )
        return () => {
            ipcRenderer.removeAllListeners('language-changed')
        }
    },
    handleNewLinuxVersion: (callback: (linuxUpdate: any) => void) => {
        ipcRenderer.on('alert-linux-update', (_event, linuxUpdate) =>
            callback(linuxUpdate)
        )
        return () => {
            ipcRenderer.removeAllListeners('alert-linux-update')
        }
    },
    displaySplashScreen: (callback: (visibility: boolean) => void) => {
        ipcRenderer.on('display-splash-screen', (_event, visibility: boolean) =>
            callback(visibility)
        )
        return () => {
            ipcRenderer.removeAllListeners('display-splash-screen')
        }
    },
})

// --------- Expose store API (comme dans l'ancienne application) ---------
contextBridge.exposeInMainWorld('store', {
    set: (key: string, value: unknown) =>
        ipcRenderer.invoke('store-set', key, value),
    get: (key: string, defaultValue?: unknown) =>
        ipcRenderer.invoke('store-get', key, defaultValue),
    delete: (key: string) => ipcRenderer.invoke('store-delete', key),
})

// --------- Expose initialization API ---------
contextBridge.exposeInMainWorld('initialisationAPI', {
    // Front → Main: Lancer l'initialisation (pour compatibilité, mais maintenant lancée automatiquement)
    initializeApplication: (forceInitialisation: boolean) =>
        ipcRenderer.invoke('initialization-app', forceInitialisation),
    // Main → Front: Écouter les messages d'initialisation
    sendInitializationMessages: (callback: (message: any) => void) => {
        ipcRenderer.on('initialization-messages', (_event, message) =>
            callback(message)
        )
        return () => {
            ipcRenderer.removeAllListeners('initialization-messages')
        }
    },
    // Main → Front: Écouter les données de configuration
    sendConfigDatasToFront: (callback: (data: any) => void) => {
        // Écouter à la fois initialization-datas et host-informations-back
        const handler1 = (_event: any, data: any) => callback(data)
        const handler2 = (_event: any, data: any) => callback(data)

        ipcRenderer.on('initialization-datas', handler1)
        ipcRenderer.on('host-informations-back', handler2)

        return () => {
            ipcRenderer.removeAllListeners('initialization-datas')
            ipcRenderer.removeAllListeners('host-informations-back')
        }
    },
})
