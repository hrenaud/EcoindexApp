import { useCallback } from 'react'
import type { IJsonMesureData, IKeyValue } from '@/interface'
import { store as storeConstants } from '@/shared/constants'
import log from 'electron-log/renderer'

const frontLog = log.scope('front/App/useAppHandlers')

interface UseAppHandlersProps {
    workDir: string
    homeDir: string
    urlsList: any[]
    localAdvConfig: any
    envVars: IKeyValue
    jsonDatas: IJsonMesureData
    t: (key: string, options?: any) => string
    setWorkDir: (dir: string) => void
    setJsonDatas: (data: IJsonMesureData) => void
    setIsJsonFromDisk: (isFromDisk: boolean) => void
    setIsFirstStart: (isFirst: boolean) => void
    consoleMessages: string
    setConsoleMessagesSnapshot: (snapshot: string) => void
    showHidePopinDuringProcess: (
        value: string | boolean,
        setPopinText: (text: string) => void,
        setDisplayPopin: (display: boolean) => void
    ) => Promise<void>
    showNotification: (title: string, options: any) => void
    setPopinText: (text: string) => void
    setDisplayPopin: (display: boolean) => void
}

export function useAppHandlers({
    workDir,
    homeDir,
    urlsList,
    localAdvConfig,
    envVars,
    jsonDatas,
    t,
    setWorkDir,
    setJsonDatas,
    setIsJsonFromDisk,
    setIsFirstStart,
    consoleMessages,
    setConsoleMessagesSnapshot,
    showHidePopinDuringProcess,
    showNotification,
    setPopinText,
    setDisplayPopin,
}: UseAppHandlersProps) {
    /**
     * Handler, launch simple mesure with the plugin.
     * @returns Promise<void>
     */
    const runSimpleMesures = async () => {
        frontLog.debug('Simple measures clicked')
        if (workDir === homeDir) {
            if (
                !confirm(
                    `${t(
                        'Are you shure to want create report(s) in your default folder?'
                    )}\n\rDestination: ${homeDir}`
                )
            )
                return
        }
        // Capturer l'état actuel des messages console pour filtrer ensuite
        setConsoleMessagesSnapshot(consoleMessages)
        await showHidePopinDuringProcess(
            `${t('Url(s) Measure (Simple mode)')} started 🚀`,
            setPopinText,
            setDisplayPopin
        )
        try {
            await window.electronAPI.handleSimpleMesures(
                urlsList,
                localAdvConfig,
                envVars
            )
            await showHidePopinDuringProcess(
                true,
                setPopinText,
                setDisplayPopin
            )
        } catch (error) {
            frontLog.error('Error on runSimpleMesures', error)
            showNotification('', {
                body: t('Error on runSimpleMesures'),
                subtitle: t('Courses Measure (Simple mode)'),
            })
            await showHidePopinDuringProcess(
                false,
                setPopinText,
                setDisplayPopin
            )
        }
    }

    /**
     * Handler, Read and Reload the Json configuration for mesures of parcours. Relaunched when workDir change.
     */
    const runJsonReadAndReload = useCallback(async () => {
        frontLog.log('Json read and reload')
        try {
            const _jsonDatas: IJsonMesureData =
                await window.electronAPI.handleJsonReadAndReload()
            frontLog.debug(`runJsonReadAndReload`, _jsonDatas)
            if (_jsonDatas) {
                setJsonDatas(_jsonDatas)
                setIsJsonFromDisk(true)
            } else {
                setIsJsonFromDisk(false)
            }
        } catch (error) {
            frontLog.error('Error on runJsonReadAndReload', error)
            showNotification('', {
                subtitle: '🚫 Courses Measure (Full mode)',
                body: 'Error on runJsonReadAndReload',
            })
        }
    }, [setJsonDatas, setIsJsonFromDisk, showNotification])

    /**
     * Handler, launch measures of parcours.
     * 1. Save Json configuration in workDir.
     * 2. Launch measures with the plugin.
     * @param saveAndCollect boolean
     * @returns Promise<void>
     */
    const runJsonSaveAndCollect = async (
        saveAndCollect = false,
        envVars: IKeyValue = {}
    ) => {
        frontLog.debug('Json save clicked')
        if (workDir === homeDir) {
            if (
                !confirm(
                    t(
                        `Are you shure to want create report(s) in your default folder?\n\rDestination: {{homeDir}}`,
                        { homeDir }
                    )
                )
            )
                return
        }
        // Capturer l'état actuel des messages console pour filtrer ensuite
        setConsoleMessagesSnapshot(consoleMessages)
        await showHidePopinDuringProcess(
            `${t('Courses Measure (Full mode)')} started 🚀`,
            setPopinText,
            setDisplayPopin
        )
        try {
            frontLog.debug(`jsonDatas`, jsonDatas)
            frontLog.debug(`saveAndCollect`, saveAndCollect)
            await window.electronAPI.handleJsonSaveAndCollect(
                jsonDatas,
                saveAndCollect,
                envVars
            )
            await showHidePopinDuringProcess(
                true,
                setPopinText,
                setDisplayPopin
            )
        } catch (error) {
            frontLog.error('Error on runJsonSaveAndCollect', error)
            showNotification('', {
                subtitle: t('🚫 Courses Measure (Full mode)'),
                body: t('Error on runJsonSaveAndCollect'),
            })
            await showHidePopinDuringProcess(
                false,
                setPopinText,
                setDisplayPopin
            )
        }
    }

    /**
     * Handlers, notify user.
     * @param title string
     * @param message string
     */
    const handlerJsonNotify = (title: string, message: string) => {
        frontLog.debug('Json notify clicked')
        showNotification('', { body: message, subtitle: title })
    }

    /**
     * Handler for selecting workDir.
     */
    const selectWorkingFolder = async () => {
        const filePath = await window.electronAPI.handleSelectFolder()

        if (filePath !== undefined) {
            setWorkDir(filePath)
        }
    }

    /**
     * Launch Initialization.
     * @param forceInitialisation
     */
    const launchInitialization = async (forceInitialisation: boolean) => {
        frontLog.debug(`initializeApplication start 🚀`)
        if (
            forceInitialisation ||
            (await window.store.get(storeConstants.APP_INSTALLED_ONCE, false))
        )
            setIsFirstStart(false)
        const result =
            await window.initialisationAPI.initializeApplication(
                forceInitialisation
            )
        frontLog.debug(
            `initializeApplication ended with ${result ? 'OK 👍' : 'KO 🚫'} status.`
        )
    }

    return {
        runSimpleMesures,
        runJsonReadAndReload,
        runJsonSaveAndCollect,
        handlerJsonNotify,
        selectWorkingFolder,
        launchInitialization,
    }
}
