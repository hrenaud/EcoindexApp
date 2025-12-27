import React, { useEffect, useRef } from 'react'
import { LinuxUpdate } from '@/class/LinuxUpdate'
import { ConfigData } from '@/class/ConfigData'
import { InitalizationMessage } from '@/types'
import { InitalizationData } from '@/class/InitalizationData'
import i18nResources from '@/configs/i18nResources'
import log from 'electron-log/renderer'
import { channels } from '@/shared/constants'

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
    const isListenerAddedRef = useRef<boolean>(false)
    // Garder une trace du dernier message pour éviter les doublons
    const lastMessageRef = useRef<{
        message: string
        timestamp: number
    } | null>(null)
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
            (data: any): any => {
                if (typeof data === 'string') {
                    const _data = JSON.parse(data)
                    frontLog.debug(`sendDatasToFront is a string`, _data)
                    setDatasFromHost((oldObject: any) => ({
                        ...oldObject,
                        ..._data,
                    }))
                } else {
                    if (data.type && (data.result || data.error)) {
                        setDatasFromHost((oldObject: any) => {
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
                        setDatasFromHost((oldObject: any) => ({
                            ...oldObject,
                            ...data,
                        }))
                    }
                }
            }
        )

        // Handler asynchronous-log
        // Créer la fonction une seule fois et la stocker dans le ref
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

                // Déduplication : ignorer les messages identiques reçus dans les 100ms
                const now = Date.now()
                const lastMessage = lastMessageRef.current
                if (
                    lastMessage &&
                    lastMessage.message === logMessage &&
                    now - lastMessage.timestamp < 100
                ) {
                    // Message dupliqué, l'ignorer
                    frontLog.debug('Duplicate message ignored:', logMessage)
                    return
                }

                // Mettre à jour la trace du dernier message
                lastMessageRef.current = { message: logMessage, timestamp: now }

                setConsoleMessages((prev) => {
                    const timestamp = new Date().toLocaleTimeString()
                    return `${prev}${prev ? '\n' : ''}[${timestamp}] ${logMessage}`
                })
            }
        }

        // Nettoyer TOUS les écouteurs existants pour ce channel avant d'en ajouter un nouveau
        // Cela garantit qu'il n'y a qu'un seul écouteur actif
        if (window.ipcRenderer && handleConsoleMessageRef.current) {
            // TOUJOURS retirer l'écouteur existant avant d'en ajouter un nouveau
            // Même si le flag indique qu'il n'a pas été ajouté, il pourrait y avoir un écouteur résiduel
            window.ipcRenderer.off(
                channels.ASYNCHRONOUS_LOG,
                handleConsoleMessageRef.current
            )

            // Ajouter le nouvel écouteur uniquement s'il n'a pas déjà été ajouté
            // Le flag empêche les ajouts multiples si le useEffect se réexécute
            if (!isListenerAddedRef.current) {
                window.ipcRenderer.on(
                    channels.ASYNCHRONOUS_LOG,
                    handleConsoleMessageRef.current
                )
                isListenerAddedRef.current = true
                frontLog.debug('asynchronous-log listener added')
            }
        }

        // Handler changeLanguageInFront
        if (cleanupChangeLanguageRef.current) {
            cleanupChangeLanguageRef.current()
        }
        cleanupChangeLanguageRef.current =
            window.electronAPI.changeLanguageInFront((lng: string): any => {
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
            if (
                window.ipcRenderer &&
                handleConsoleMessageRef.current &&
                isListenerAddedRef.current
            ) {
                window.ipcRenderer.off(
                    channels.ASYNCHRONOUS_LOG,
                    handleConsoleMessageRef.current
                )
                isListenerAddedRef.current = false
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Dépendances vides : les listeners ne doivent être ajoutés qu'une seule fois au montage
}
