import React, { useEffect, useRef } from 'react'
import { LinuxUpdate } from '@/class/LinuxUpdate'
import { ConfigData } from '@/class/ConfigData'
import { InitalizationMessage } from '@/types'
import { InitalizationData } from '@/class/InitalizationData'
import i18nResources from '@/configs/i18nResources'
import log from 'electron-log/renderer'

const frontLog = log.scope('front/App/useIpcListeners')

interface UseIpcListenersProps {
    tRef: React.MutableRefObject<(key: string, options?: any) => string>
    setDatasFromHost: React.Dispatch<React.SetStateAction<any>>
    setConsoleMessages: React.Dispatch<React.SetStateAction<string>>
    setWorkDir: (dir: string) => void
    setHomeDir: (dir: string) => void
    setAppReady: (ready: boolean) => void
    setIsPuppeteerBrowserInstalled: (installed: boolean) => void
    setPuppeteerBrowserInstalledVersion: (version: string) => void
    setInformationPopinTitle: (title: string) => void
    setInformationPopinMessage: (message: string) => void
    setInformationPopinErrorLink: (link: { label: string; url: string }) => void
    setDisplayInformationPopin: (display: boolean) => void
    setShowInformationSpinner: (show: boolean) => void
    setInformationPopinIsAlert: (isAlert: boolean) => void
    sleep: (ms: number, clear?: boolean) => Promise<void>
}

export function useIpcListeners({
    tRef,
    setDatasFromHost,
    setConsoleMessages,
    setWorkDir,
    setHomeDir,
    setAppReady,
    setIsPuppeteerBrowserInstalled,
    setPuppeteerBrowserInstalledVersion,
    setInformationPopinTitle,
    setInformationPopinMessage,
    setInformationPopinErrorLink,
    setDisplayInformationPopin,
    setShowInformationSpinner,
    setInformationPopinIsAlert,
    sleep,
}: UseIpcListenersProps) {
    const handleConsoleMessageRef = useRef<
        | ((_event: any, message: string, ...optionalParams: any[]) => void)
        | null
    >(null)
    const cleanupLinuxVersionRef = useRef<(() => void) | null>(null)
    const cleanupSendDatasRef = useRef<(() => void) | null>(null)
    const cleanupChangeLanguageRef = useRef<(() => void) | null>(null)
    const cleanupInitializationRef = useRef<(() => void) | null>(null)

    useEffect(() => {
        if (!window.electronAPI) {
            frontLog.error('window.electronAPI is not available!')
            return
        }

        // Handler Linux Update
        if (cleanupLinuxVersionRef.current) {
            cleanupLinuxVersionRef.current()
        }
        cleanupLinuxVersionRef.current =
            window.electronAPI.handleNewLinuxVersion(
                (linuxUpdate: LinuxUpdate) => {
                    frontLog.debug(`linuxUpdate`, linuxUpdate)
                    const resp = window.confirm(
                        tRef.current(
                            `A new version of the app is avalaible ({{version}}), do you want to download it?`,
                            { version: linuxUpdate.latestReleaseVersion }
                        )
                    )
                    if (resp === true) {
                        window.open(
                            linuxUpdate.latestReleaseURL,
                            `_blank`,
                            'noopener,noreferrer'
                        )
                    }
                }
            )

        // Handler sendDatasToFront
        if (cleanupSendDatasRef.current) {
            cleanupSendDatasRef.current()
        }
        cleanupSendDatasRef.current = window.electronAPI.sendDatasToFront(
            (data: any) => {
                if (typeof data === 'string') {
                    const _data = JSON.parse(data)
                    frontLog.debug(`sendDatasToFront is a string`, _data)
                    setDatasFromHost((oldObject) => ({
                        ...oldObject,
                        ..._data,
                    }))
                } else {
                    if (data.type && (data.result || data.error)) {
                        setDatasFromHost((oldObject) => {
                            const o: any = {
                                ...oldObject,
                            }
                            const type = (data as ConfigData).type
                            o[type] = data
                            return o
                        })
                    } else {
                        frontLog.debug(
                            `sendDatasToFront is object`,
                            JSON.stringify(data, null, 2)
                        )
                        setDatasFromHost((oldObject) => ({
                            ...oldObject,
                            ...data,
                        }))
                    }
                }
            }
        )

        // Handler asynchronous-log
        if (!handleConsoleMessageRef.current) {
            handleConsoleMessageRef.current = (
                _event: any,
                message: string,
                ...optionalParams: any[]
            ) => {
                const logMessage =
                    optionalParams && optionalParams.length > 0
                        ? `${message} ${optionalParams.join(' ')}`
                        : message || ''
                setConsoleMessages((prev) => {
                    const timestamp = new Date().toLocaleTimeString()
                    return `${prev}${prev ? '\n' : ''}[${timestamp}] ${logMessage}`
                })
            }
        }

        if (window.ipcRenderer && handleConsoleMessageRef.current) {
            window.ipcRenderer.off(
                'asynchronous-log',
                handleConsoleMessageRef.current
            )
            window.ipcRenderer.on(
                'asynchronous-log',
                handleConsoleMessageRef.current
            )
        }

        // Handler changeLanguageInFront
        if (cleanupChangeLanguageRef.current) {
            cleanupChangeLanguageRef.current()
        }
        cleanupChangeLanguageRef.current =
            window.electronAPI.changeLanguageInFront((lng: string) => {
                try {
                    i18nResources.changeLanguage(lng, (err, t) => {
                        if (err)
                            return frontLog.error(
                                'something went wrong loading',
                                err
                            )
                        t('key')
                    })
                } catch (error) {
                    frontLog.error(error)
                }
            })

        // Read language from Store
        const getLanguage = async () => {
            try {
                const gettedLng = await window.store.get(`language`, `fr`)
                if (gettedLng) {
                    i18nResources.changeLanguage(gettedLng)
                }
            } catch (error) {
                frontLog.debug(error)
            }
        }
        getLanguage()

        // Handler initialization messages
        if (!window.initialisationAPI) {
            frontLog.error('window.initialisationAPI is not available!')
            return
        }

        if (cleanupInitializationRef.current) {
            cleanupInitializationRef.current()
        }
        cleanupInitializationRef.current =
            window.initialisationAPI.sendInitializationMessages(
                async (message: InitalizationMessage) => {
                    frontLog.debug(`sendInitializationMessages`, message)

                    if (message.type === 'data') {
                        switch (message.data?.type) {
                            case InitalizationData.WORKDIR:
                                setWorkDir(message.data.result as string)
                                break
                            case InitalizationData.HOMEDIR:
                                setHomeDir(message.data.result as string)
                                break
                            case InitalizationData.APP_READY:
                                setAppReady(message.data.result as boolean)
                                break
                            case InitalizationData.PUPPETEER_BROWSER_INSTALLED:
                                setIsPuppeteerBrowserInstalled(
                                    message.data.result as boolean
                                )
                                setPuppeteerBrowserInstalledVersion(
                                    message.data.result as string
                                )
                                break
                            case InitalizationData.APP_CAN_NOT_BE_LAUNCHED:
                                setInformationPopinTitle(`${message.title}`)
                                setInformationPopinMessage(message.message)
                                break
                        }
                    } else {
                        setInformationPopinTitle(message.title)
                        setInformationPopinMessage(message.message)
                        setInformationPopinErrorLink(
                            message?.errorLink || { label: '', url: '' }
                        )
                    }

                    if (message.modalType === 'started') {
                        setDisplayInformationPopin(true)
                    } else if (message.modalType === 'completed') {
                        await sleep(2000)
                        setDisplayInformationPopin(false)
                    } else if (message.modalType === 'error') {
                        setDisplayInformationPopin(true)
                        setShowInformationSpinner(false)
                        setInformationPopinIsAlert(true)
                    }
                }
            )

        // Cleanup
        return () => {
            if (cleanupLinuxVersionRef.current) {
                cleanupLinuxVersionRef.current()
                cleanupLinuxVersionRef.current = null
            }
            if (cleanupSendDatasRef.current) {
                cleanupSendDatasRef.current()
                cleanupSendDatasRef.current = null
            }
            if (cleanupChangeLanguageRef.current) {
                cleanupChangeLanguageRef.current()
                cleanupChangeLanguageRef.current = null
            }
            if (cleanupInitializationRef.current) {
                cleanupInitializationRef.current()
                cleanupInitializationRef.current = null
            }
            if (window.ipcRenderer && handleConsoleMessageRef.current) {
                window.ipcRenderer.off(
                    'asynchronous-log',
                    handleConsoleMessageRef.current
                )
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Dépendances vides : les listeners ne doivent être ajoutés qu'une seule fois au montage
}
