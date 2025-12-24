import * as path from 'node:path'

import i18n, { use as i18nUse, init } from 'i18next'

import Backend from 'i18next-fs-backend'
import { app } from 'electron'

try {
    const IS_PROD = process.env.NODE_ENV === 'production'
    const root = process.cwd()
    const isPackaged = app ? app.isPackaged : false

    i18nUse(Backend)

    // Initialize i18n
    if (!i18n.isInitialized) {
        init({
            debug: !IS_PROD,
            lng: 'en',
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
            backend: {
                loadPath:
                    IS_PROD && isPackaged && process.resourcesPath
                        ? path.join(
                              process.resourcesPath,
                              'locales/{{lng}}/{{ns}}.json'
                          )
                        : path.join(root, 'src/locales/{{lng}}/{{ns}}.json'),
            },
        })
    }

    i18n.languages = ['en', 'fr']
} catch (error) {
    console.error('i18n initialization error:', error)
}

export default i18n
