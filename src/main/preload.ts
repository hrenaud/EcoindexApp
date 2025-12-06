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

// --------- Expose language API ---------
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
})

// --------- Expose store API (comme dans l'ancienne application) ---------
contextBridge.exposeInMainWorld('store', {
    set: (key: string, value: unknown) =>
        ipcRenderer.invoke('store-set', key, value),
    get: (key: string, defaultValue?: unknown) =>
        ipcRenderer.invoke('store-get', key, defaultValue),
    delete: (key: string) => ipcRenderer.invoke('store-delete', key),
})
