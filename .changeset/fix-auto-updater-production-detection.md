---
"ecoindex-app": patch
---

## Correction de la détection de production pour l'auto-update

- **Correction de la détection de production** : Remplacement de `process.env.NODE_ENV === 'production'` par `app.isPackaged` pour déterminer si l'application est en production. `NODE_ENV` n'est pas défini dans les builds GitHub Actions, ce qui désactivait l'auto-update même en production. `app.isPackaged` est la méthode recommandée en Electron pour détecter si l'application est packagée (build de production).

