---
"ecoindex-app": patch
---

## Corrections de l'auto-update

- **Correction de la détection de production** : Remplacement de `process.env.NODE_ENV === 'production'` par `app.isPackaged` pour déterminer si l'application est en production. `NODE_ENV` n'est pas défini dans les builds GitHub Actions, ce qui désactivait l'auto-update même en production. `app.isPackaged` est la méthode recommandée en Electron pour détecter si l'application est packagée (build de production).

- **Configuration de l'URL du feed** : Ajout de `autoUpdater.setFeedURL()` avec le provider 'generic' pour configurer l'auto-update avec `update.electronjs.org`. `update.electronjs.org` est un service qui convertit les releases GitHub en format compatible avec electron-updater. L'URL doit pointer vers la base (sans version) : `https://update.electronjs.org/{owner}/{repo}/{platform}-{arch}`, car `update.electronjs.org` gère automatiquement les versions via les releases GitHub.

