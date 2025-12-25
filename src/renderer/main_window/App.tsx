import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { InformationPopin } from '@/components/InformationPopin'
import type { InitalizationMessage } from '@/types'
import { cn } from '@/lib/utils'

function App() {
    const [count, setCount] = useState(0)
    const { t } = useTranslation()

    // États pour la popin d'initialisation
    const [displayInformationPopin, setDisplayInformationPopin] =
        useState(false)
    const [informationPopinTitle, setInformationPopinTitle] = useState('')
    const [informationPopinMessage, setInformationPopinMessage] = useState('')
    const [informationPopinErrorLink, setInformationPopinErrorLink] = useState<{
        label: string
        url: string
    }>({
        label: '',
        url: '',
    })
    const [informationPopinIsAlert, setInformationPopinIsAlert] =
        useState(false)
    const [showInformationSpinner, setShowInformationSpinner] = useState(true)
    const [initializationProgress, setInitializationProgress] = useState(0)
    const [initializationSteps, setInitializationSteps] = useState(0)

    // Écouter les messages d'initialisation
    useEffect(() => {
        const unsubscribe = window.initialisationAPI.sendInitializationMessages(
            async (message: InitalizationMessage) => {
                console.log('Initialization message received:', message)

                // Gérer les messages de type 'data' et 'message'
                if (message.type === 'data') {
                    // Pour les messages de type data, on peut traiter les données
                    // mais on garde l'affichage actuel si le titre/message sont vides
                    console.log('Data message:', message.data)
                    // Ne pas mettre à jour le titre/message si ils sont vides pour les messages data
                    if (message.title || message.message) {
                        if (message.title)
                            setInformationPopinTitle(message.title)
                        if (message.message)
                            setInformationPopinMessage(message.message)
                    }
                } else {
                    // Pour les messages normaux, toujours mettre à jour
                    if (message.title) {
                        setInformationPopinTitle(message.title)
                    }
                    if (message.message) {
                        setInformationPopinMessage(message.message)
                    }
                    setInformationPopinErrorLink(
                        message.errorLink || { label: '', url: '' }
                    )
                }

                // Mettre à jour la progression
                if (message.step && message.steps) {
                    setInitializationSteps(message.steps)
                    const progress = (message.step / message.steps) * 100
                    setInitializationProgress(progress)
                }

                // Gérer les différents types de modal
                if (message.modalType === 'started') {
                    setDisplayInformationPopin(true)
                    setShowInformationSpinner(true)
                    setInformationPopinIsAlert(false)
                } else if (message.modalType === 'completed') {
                    // Attendre 2 secondes avant de fermer
                    await new Promise((resolve) => setTimeout(resolve, 2000))
                    setDisplayInformationPopin(false)
                } else if (message.modalType === 'error') {
                    setDisplayInformationPopin(true)
                    setShowInformationSpinner(false)
                    setInformationPopinIsAlert(true)
                }
            }
        )

        return () => {
            unsubscribe()
        }
    }, [])

    return (
        <>
            <div className="bg-background min-h-screen p-8">
                <div className="mx-auto max-w-4xl space-y-8">
                    <div className="flex justify-end">
                        <LanguageSwitcher />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('app.title')}</CardTitle>
                            <CardDescription>
                                {t('app.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-muted-foreground">
                                    {t('app.welcome')}
                                </p>
                                <div className="flex items-center gap-4">
                                    <Button
                                        onClick={() =>
                                            setCount((count) => count + 1)
                                        }
                                    >
                                        {t('app.count', { count })}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCount(0)}
                                    >
                                        {t('app.reset')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <InformationPopin
                id="informationPopin"
                display={displayInformationPopin}
                title={informationPopinTitle}
                showSpinner={showInformationSpinner}
                isAlert={informationPopinIsAlert}
                errorLink={
                    informationPopinErrorLink.label
                        ? informationPopinErrorLink
                        : undefined
                }
                showProgress={initializationSteps > 0}
                progress={initializationProgress}
            >
                <div
                    className={cn(
                        'text-sm break-words whitespace-pre-line',
                        !informationPopinIsAlert
                            ? 'italic'
                            : 'font-bold !text-red-500'
                    )}
                >
                    {informationPopinMessage}
                </div>
                {informationPopinErrorLink &&
                    informationPopinErrorLink.label !== '' && (
                        <a
                            className="underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={informationPopinErrorLink.url}
                        >
                            {informationPopinErrorLink.label}
                        </a>
                    )}
            </InformationPopin>
        </>
    )
}

export default App
