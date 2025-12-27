import { IpcMainEvent } from 'electron'
import Store from 'electron-store'
import { channels } from '../../../shared/constants'
import { getMainLog } from '../../main'
import { getMainWindow } from '../../memory'
import pkg from '../../../../package.json'

const store = new Store()

/**
 * Convert Version to string (local util for main process)
 */
const convertVersion = (version: string) => {
    return version.replace(/\./gm, '_').replace(/-/gm, '_')
}

export const handleSplashScreen = async (
    _event: IpcMainEvent | null,
    display: 'normal' | 'resetAndDisplay'
) => {
    const mainLog = getMainLog().scope('main/handleSplashScreen')
    const displayHello = `displayHello.${convertVersion(pkg.version)}`
    const displayHelloChecked = (await store.get(
        displayHello
    )) as unknown as boolean
    try {
        if (display === 'normal') {
            mainLog.info('Display splash screen')
            if (!displayHelloChecked) {
                const mainWindow = getMainWindow()
                if (mainWindow) {
                    mainWindow.webContents.send(
                        channels.DISPLAY_SPLASH_SCREEN,
                        true
                    )
                }
            }
            return true
        }
        if (display === 'resetAndDisplay') {
            mainLog.info('Reset and display splash screen')
            await store.set(displayHello, false)
            const mainWindow = getMainWindow()
            if (mainWindow) {
                mainWindow.webContents.send(
                    channels.DISPLAY_SPLASH_SCREEN,
                    true
                )
            }
            return true
        }
        mainLog.error('Do not display splash screen')
        return false
    } catch (error) {
        mainLog.error(error)
    }
}
