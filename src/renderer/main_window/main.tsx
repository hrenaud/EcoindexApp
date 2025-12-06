import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'

import i18n from '../../configs/i18nResources'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <React.Suspense fallback="loading">
            <I18nextProvider i18n={i18n}>
                <App />
            </I18nextProvider>
        </React.Suspense>
    </React.StrictMode>
)
