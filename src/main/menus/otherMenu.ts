import { BrowserWindow, app as ElectronApp, shell } from 'electron'

import Store from 'electron-store'
import log from 'electron-log'
import i18n from '../../configs/i18next.config'
import pkg from '../../../package.json'

const mainLog = log.scope('main/otherMenu')
const store = new Store()

// Configuration des langues disponibles
const lngs = [
    { code: 'fr', lng: 'Français' },
    { code: 'en', lng: 'English' },
]

import type { MenuItemConstructorOptions } from 'electron'

export const otherTemplate = (
    app: typeof ElectronApp,
    mainWindow: BrowserWindow,
    _i18n: typeof i18n
): MenuItemConstructorOptions[] => {
    try {
        const logFile = log.transports.file.getFile().path

        // Menu de langue
        const languageMenu = lngs.map((languageCode) => {
            return {
                label: languageCode.lng,
                type: 'radio' as const,
                checked: _i18n.language === languageCode.code,
                click: () => {
                    store.set('language', languageCode.code)
                    _i18n.changeLanguage(languageCode.code)
                    // Notifier toutes les fenêtres
                    BrowserWindow.getAllWindows().forEach((window) => {
                        window.webContents.send(
                            'language-changed',
                            languageCode.code
                        )
                    })
                    // Le menu sera reconstruit automatiquement via changeLanguage dans main.ts
                },
            }
        })

        const menu: MenuItemConstructorOptions[] = [
            {
                label: _i18n.t('menu.file'),
                submenu: [
                    {
                        label: _i18n.t('menu.quit'),
                        accelerator: 'Ctrl+Q',
                        click: () => {
                            app.quit()
                        },
                    },
                ],
            },
            {
                label: _i18n.t('menu.edit'),
                submenu: [
                    { label: _i18n.t('menu.undo'), role: 'undo' },
                    { label: _i18n.t('menu.redo'), role: 'redo' },
                    { type: 'separator' },
                    { label: _i18n.t('menu.cut'), role: 'cut' },
                    { label: _i18n.t('menu.copy'), role: 'copy' },
                    { label: _i18n.t('menu.paste'), role: 'paste' },
                    { label: _i18n.t('menu.delete'), role: 'delete' },
                    { type: 'separator' },
                    { label: _i18n.t('menu.selectAll'), role: 'selectAll' },
                ],
            },
            {
                label: _i18n.t('menu.view'),
                submenu: [
                    {
                        label: _i18n.t('menu.reload'),
                        accelerator: 'Ctrl+R',
                        click: (_: any, focusedWindow: BrowserWindow) => {
                            if (focusedWindow) {
                                focusedWindow.reload()
                            }
                        },
                    },
                    {
                        role: 'forceReload',
                        label: _i18n.t('menu.forceReload'),
                    },
                    {
                        label: _i18n.t('menu.fullScreen'),
                        accelerator: 'F11',
                        click: (_: any, focusedWindow: BrowserWindow) => {
                            if (focusedWindow) {
                                focusedWindow.setFullScreen(
                                    !focusedWindow.isFullScreen()
                                )
                            }
                        },
                    },
                    {
                        label: _i18n.t('menu.minimize'),
                        accelerator: 'Ctrl+M',
                        role: 'minimize',
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: _i18n.t('menu.toggleDeveloperTools'),
                        accelerator: 'Ctrl+Shift+I',
                        click: (_: any, focusedWindow: BrowserWindow) => {
                            if (focusedWindow) {
                                focusedWindow.webContents.toggleDevTools()
                            }
                        },
                    },
                ],
            },
            {
                label: _i18n.t('menu.language'),
                submenu: languageMenu,
            },
            {
                label: _i18n.t('menu.help'),
                submenu: [
                    {
                        label: `${_i18n.t('menu.learnMoreAbout')} ${pkg.productName}`,
                        click: async () => {
                            await shell.openExternal(
                                'https://cnumr.github.io/lighthouse-plugin-ecoindex/'
                            )
                        },
                    },
                    {
                        type: 'separator',
                    },
                    {
                        label: _i18n.t('Open splash window...'),
                        click: async () => {
                            const { handleSplashScreen } =
                                await import('../handlers/initHandlers/HandleSplashScreen')
                            await handleSplashScreen(null, 'resetAndDisplay')
                        },
                    },
                    {
                        label: _i18n.t('menu.log'),
                        click: async () => {
                            await shell.openPath(logFile)
                        },
                    },
                ],
            },
        ]

        return menu
    } catch (error) {
        mainLog.error('Error in otherTemplate', error)
        return []
    }
}
