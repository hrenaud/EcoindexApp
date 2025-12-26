import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'

import i18n from '../../configs/i18nResources'

import App from './App'

const rootElement = document.getElementById('root')
if (!rootElement) {
    console.error('Root element not found!')
} else {
    try {
        ReactDOM.createRoot(rootElement).render(
            <React.StrictMode>
                <React.Suspense fallback={<div>Loading...</div>}>
                    <I18nextProvider i18n={i18n}>
                        <App />
                    </I18nextProvider>
                </React.Suspense>
            </React.StrictMode>
        )
        console.log('App rendered successfully')
    } catch (error) {
        console.error('Error rendering app:', error)
        rootElement.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error instanceof Error ? error.message : String(error)}</div>`
    }
}
