import { IpcRendererEvent } from 'electron'

declare global {
    interface Window {
        ipcRenderer: {
            on(
                channel: string,
                listener: (event: IpcRendererEvent, ...args: any[]) => void
            ): void
            off(
                channel: string,
                listener: (event: IpcRendererEvent, ...args: any[]) => void
            ): void
            send(channel: string, ...args: any[]): void
            invoke(channel: string, ...args: any[]): Promise<any>
        }
        electronAPI: {
            changeLanguage: (lang: string) => Promise<void>
            getLanguage: () => Promise<string>
            onLanguageChanged: (callback: (lang: string) => void) => () => void
        }
        store: {
            set: (key: string, value: unknown) => Promise<void>
            get: (key: string, defaultValue?: unknown) => Promise<unknown>
            delete: (key: string) => Promise<void>
        }
    }
}

export {}
