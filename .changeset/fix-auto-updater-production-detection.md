---
"ecoindex-app": patch
---

## Corrections de l'auto-update

- **Correction de la détection de production** : Remplacement de `process.env.NODE_ENV === 'production'` par `app.isPackaged` pour déterminer si l'application est en production. `NODE_ENV` n'est pas défini dans les builds GitHub Actions, ce qui désactivait l'auto-update même en production. `app.isPackaged` est la méthode recommandée en Electron pour détecter si l'application est packagée (build de production).

- **Configuration de l'URL du feed** : Ajout de `autoUpdater.setFeedURL()` avec le provider 'github' pour configurer l'auto-update avec les releases GitHub. `update.electronjs.org` fonctionne avec le provider 'github' qui détecte automatiquement les releases GitHub et les convertit en format compatible. Le provider 'generic' ne fonctionne pas avec `update.electronjs.org` car il essaie d'accéder à `latest-mac.yml` ce qui cause une erreur 400 "Invalid SemVer".

