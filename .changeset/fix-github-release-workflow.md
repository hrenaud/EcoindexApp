---
"ecoindex-app": patch
---

## Corrections du workflow GitHub Actions

- **Correction du pattern de fichiers** : Suppression du pattern `artifacts/**/*Setup.exe` (avec S majuscule) qui ne correspondait à aucun fichier et générait un warning. Le fichier Windows est `setup.exe` (minuscule).
- **Ajout de `fail_on_unmatched_files: false`** : Permet au workflow de continuer même si certains patterns ne correspondent à aucun fichier, évitant les erreurs lors de la création de release GitHub.
- **Ajout de `overwrite_files: false`** : Empêche l'action de tenter de mettre à jour des assets existants, ce qui causait l'erreur "Not Found" lors de l'upload de fichiers dupliqués. Le paramètre `overwrite` n'existe pas dans cette action, c'est `overwrite_files` qui doit être utilisé.

