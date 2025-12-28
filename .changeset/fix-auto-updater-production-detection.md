---
"ecoindex-app": patch
---

## Corrections de l'auto-update

- **Correction de la détection de production** : Remplacement de `process.env.NODE_ENV === 'production'` par `app.isPackaged` pour déterminer si l'application est en production. `NODE_ENV` n'est pas défini dans les builds GitHub Actions, ce qui désactivait l'auto-update même en production. `app.isPackaged` est la méthode recommandée en Electron pour détecter si l'application est packagée (build de production).

- **Configuration du provider GitHub** : Utilisation du provider 'github' pour `electron-updater` afin d'utiliser directement l'API GitHub pour récupérer les releases. `update.electronjs.org` est conçu pour l'auto-updater natif d'Electron (`electron.autoUpdater`), pas pour `electron-updater` qui nécessite des fichiers `latest-mac.yml` générés par `electron-builder`. Comme ce projet utilise Electron Forge (pas electron-builder), le provider 'github' est la solution appropriée pour récupérer les releases GitHub directement.

