---
"ecoindex-app": patch
---

## Corrections de l'auto-update

- **Correction de la détection de production** : Remplacement de `process.env.NODE_ENV === 'production'` par `app.isPackaged` pour déterminer si l'application est en production. `NODE_ENV` n'est pas défini dans les builds GitHub Actions, ce qui désactivait l'auto-update même en production. `app.isPackaged` est la méthode recommandée en Electron pour détecter si l'application est packagée (build de production).

- **Configuration de l'URL du feed** : Ajout de `autoUpdater.setFeedURL()` pour configurer l'URL du feed `update.electronjs.org`. Sans cette configuration, `electron-updater` cherchait un fichier `app-update.yml` qui n'existe pas, causant l'erreur "ENOENT: no such file or directory, open 'app-update.yml'". La configuration de l'URL du feed permet à `electron-updater` de fonctionner correctement avec `update.electronjs.org`.

