import i18n from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'

try {
    i18n.use(
        resourcesToBackend(
            (language: string, namespace: string) =>
                import(`../locales/${language}/${namespace}.json`)
        )
    )
    i18n.on('failedLoading', (_lng, _ns, msg) => console.error(msg))

    // Initialiser avec la langue par défaut
    // La langue sauvegardée sera chargée dans le composant LanguageSwitcher
    i18n.init({
        debug: false,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
    })

    i18n.languages = ['en', 'fr']

    // Charger la langue sauvegardée après l'initialisation
    if (typeof window !== 'undefined' && window.electronAPI) {
        window.electronAPI.getLanguage().then((lang) => {
            if (lang && lang !== i18n.language) {
                i18n.changeLanguage(lang)
            }
        })
    }
} catch (error) {
    console.error('i18n initialization error:', error)
}

export default i18n
