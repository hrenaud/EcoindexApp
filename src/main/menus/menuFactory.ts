import { BrowserWindow, Menu, app as ElectronApp } from 'electron'

import log from 'electron-log'
import i18n from '../../configs/i18next.config'
import { darwinTemplate } from './darwinMenu'
import { otherTemplate } from './otherMenu'

const mainLog = log.scope('main/menuFactory')

export const buildMenu = (
    app: typeof ElectronApp,
    mainWindow: BrowserWindow,
    _i18n: typeof i18n
) => {
    try {
        if (process.platform === 'darwin') {
            const menu = Menu.buildFromTemplate(
                darwinTemplate(app, mainWindow, _i18n)
            )
            Menu.setApplicationMenu(menu)
        } else {
            const menu = Menu.buildFromTemplate(
                otherTemplate(app, mainWindow, _i18n)
            )
            mainWindow.setMenu(menu)
        }
    } catch (error) {
        mainLog.error('Error in buildMenu', error)
    }
}
