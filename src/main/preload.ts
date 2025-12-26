import { contextBridge, ipcRenderer } from 'electron'
import type {
    ISimpleUrlInput,
    IAdvancedMesureData,
    IKeyValue,
    IJsonMesureData,
} from '../interface'

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
    // Front → Main: Handlers pour les mesures
    handleSimpleMesures: (
        urlsList: ISimpleUrlInput[],
        localAdvConfig: IAdvancedMesureData,
        envVars: IKeyValue
    ) =>
        ipcRenderer.invoke('simple-mesures', urlsList, localAdvConfig, envVars),
    handleJsonSaveAndCollect: (
        jsonDatas: IJsonMesureData,
        andCollect: boolean,
        envVars: IKeyValue
    ) => ipcRenderer.invoke('save-json-file', jsonDatas, andCollect, envVars),
    handleJsonReadAndReload: () => ipcRenderer.invoke('read-reload-json-file'),
    handleSelectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
    handleSelectPuppeteerFilePath: () =>
        ipcRenderer.invoke('dialog:select-puppeteer-file'),
    handleIsJsonConfigFileExist: (workDir: string) =>
        ipcRenderer.invoke('is-json-config-file-exist', workDir),
    // Main → Front: Écouter les données depuis le main
    sendDatasToFront: (callback: (data: any) => void) => {
        ipcRenderer.on('host-informations-back', (_event, data) =>
            callback(data)
        )
        return () => {
            ipcRenderer.removeAllListeners('host-informations-back')
        }
    },
    changeLanguageInFront: (callback: (lng: string) => void) => {
        ipcRenderer.on('change-language-to-front', (_event, lng: string) =>
            callback(lng)
        )
        return () => {
            ipcRenderer.removeAllListeners('change-language-to-front')
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

// --------- Expose versions API ---------
contextBridge.exposeInMainWorld('versions', {
    chrome: () => process.versions.chrome,
    node: () => process.versions.node,
    electron: () => process.versions.electron,
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
