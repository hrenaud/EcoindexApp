---
"ecoindex-app": patch
---

## Corrections et améliorations

### GitHub Actions
- **Fix** : Mise à jour du runner macOS-13 vers macOS-15 pour éviter les erreurs de dépréciation
  - Le runner `macos-13` est maintenant retiré par GitHub Actions
  - Utilisation de `macos-15` (macos-15-intel) comme recommandé

### Documentation
- **Docs** : Ajout de commentaires explicatifs dans le code pour améliorer la compréhension
  - Documentation détaillée du flux de collecte dans `HandleCollectAll.ts`
  - Explication des handlers utilisateur dans `useAppHandlers.ts`
  - Documentation de la communication IPC dans `useIpcListeners.ts`
  - Commentaires sur les processus utilityProcess, gestion des chemins de script, etc.

### Corrections TypeScript et ESLint
- **Fix** : Correction de toutes les erreurs TypeScript (45 erreurs corrigées)
  - Types IpcMainInvokeEvent vs IpcMainEvent
  - Propriétés non initialisées avec definite assignment
  - Vérifications de undefined pour objets optionnels
  - Types de callback corrigés dans interface.d.ts
  - Gestion de SetStateAction dans les composants React
  - Corrections dans les menus (BaseWindow vs BrowserWindow)
  - Import CliFlags corrigé
  - Ajout de showConfirmDialog dans IElectronAPI

- **Fix** : Correction d'une erreur ESLint (import React manquant)

