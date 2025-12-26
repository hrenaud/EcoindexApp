import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import log from 'electron-log/renderer'

const frontLog = log.scope('front/LanguageSwitcher')

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation()
    const [currentLang, setCurrentLang] = useState(i18n.language)

    useEffect(() => {
        // Charger la langue sauvegardée au montage
        const loadSavedLanguage = async () => {
            if (window.electronAPI) {
                try {
                    const savedLang = await window.electronAPI.getLanguage()
                    if (savedLang && savedLang !== i18n.language) {
                        await i18n.changeLanguage(savedLang)
                        setCurrentLang(savedLang)
                    }
                } catch (error) {
                    frontLog.error('Error loading saved language:', error)
                }
            }
        }
        loadSavedLanguage()

        // Écouter les changements de langue depuis le menu Electron ou le main process
        // App.tsx gère déjà le changement via changeLanguageInFront, on synchronise juste currentLang
        if (window.electronAPI) {
            const unsubscribe = window.electronAPI.onLanguageChanged((lang) => {
                // Mettre à jour seulement l'état local, le changement de langue est déjà fait par App.tsx
                setCurrentLang(lang)
            })
            return unsubscribe
        }
    }, [i18n])

    // Synchroniser currentLang avec i18n.language quand il change
    useEffect(() => {
        const handleLanguageChanged = (lng: string) => {
            if (lng !== currentLang) {
                setCurrentLang(lng)
            }
        }
        i18n.on('languageChanged', handleLanguageChanged)
        return () => {
            i18n.off('languageChanged', handleLanguageChanged)
        }
    }, [i18n, currentLang])

    const handleLanguageChange = async (lang: string) => {
        // Mettre à jour l'état local immédiatement pour l'UI
        setCurrentLang(lang)
        // Notifier le processus principal pour mettre à jour le menu
        // Le main process changera la langue et enverra l'événement 'change-language-to-front'
        // qui sera capturé par App.tsx pour changer la langue
        if (window.electronAPI) {
            await window.electronAPI.changeLanguage(lang)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
                {t('language.label')}:
            </span>
            <div className="flex gap-1">
                <Button
                    variant={currentLang === 'fr' ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleLanguageChange('fr')}
                    aria-label={t('language.french')}
                    disabled={currentLang === 'fr'}
                >
                    FR
                </Button>
                <Button
                    variant={currentLang === 'en' ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleLanguageChange('en')}
                    aria-label={t('language.english')}
                    disabled={currentLang === 'en'}
                >
                    EN
                </Button>
            </div>
        </div>
    )
}
