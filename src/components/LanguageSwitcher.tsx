import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

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
                    console.error('Error loading saved language:', error)
                }
            }
        }
        loadSavedLanguage()

        // Écouter les changements de langue depuis le menu Electron
        if (window.electronAPI) {
            const unsubscribe = window.electronAPI.onLanguageChanged((lang) => {
                i18n.changeLanguage(lang)
                setCurrentLang(lang)
            })
            return unsubscribe
        }
    }, [i18n])

    const handleLanguageChange = async (lang: string) => {
        await i18n.changeLanguage(lang)
        setCurrentLang(lang)
        // Notifier le processus principal pour mettre à jour le menu
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
