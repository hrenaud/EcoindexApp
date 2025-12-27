---
"ecoindex-app": minor
---

## Résumé des modifications depuis décembre 2024

### Nouvelles fonctionnalités

- **Confirmation avant mesure simple** : Ajout d'une boîte de dialogue de confirmation si un fichier JSON de configuration est détecté avant de lancer une mesure simple
- **Affichage des logs de mesure** : Ajout d'un Textarea dans la popin de chargement affichant les logs générés depuis le début de la mesure avec auto-scroll
- **Système de menu dynamique** : Menu de l'application qui se met à jour automatiquement lors du changement de langue
- **Système de mise à jour automatique** : Implémentation complète pour macOS/Windows et notifications pour Linux
- **Splash Screen** : Affichage d'un écran d'accueil avec contenu markdown et option "ne plus afficher"
- **Mode sombre** : Support du dark mode avec détection automatique et switch manuel
- **Composants de mesure** : Intégration complète des composants pour mesures simples et complexes (JSON/courses)
- **Gestion des traductions** : Ajout de nombreuses clés de traduction pour toutes les nouvelles fonctionnalités

### Améliorations et refactorisations

- **Centralisation des channels IPC** : Tous les channels IPC sont maintenant centralisés dans `constants.ts` pour une meilleure maintenabilité
- **Refactorisation de App.tsx** : Division en hooks personnalisés (useAppState, useAppHandlers, useAppUtils, useIpcListeners, useWorkDirEffect) pour améliorer la maintenabilité
- **Gestion des listeners IPC** : Correction des fuites mémoire EventEmitter et amélioration de la gestion des listeners
- **Simplification du LanguageSwitcher** : Élimination du clignotement lors du changement de langue
- **Amélioration du logging** : Remplacement de console.log/error par electron-log dans tout le codebase
- **Nettoyage du code** : Suppression de nombreux fichiers et fonctions inutilisés (EchoReadable, displayReloadButton, forceRefresh, etc.)
- **Organisation des composants** : Déplacement des composants et libs vers `src/renderer/` pour une meilleure organisation

### Corrections de bugs

- **Affichage des messages console** : Correction des doublons de messages dans ConsoleApp
- **Synchronisation du changement de langue** : Correction du clignotement et amélioration de la synchronisation entre menu et interface
- **Clés de traduction manquantes** : Ajout de toutes les clés de traduction manquantes en français et en anglais
- **Résolution de chemins** : Alignement de la logique de résolution de chemins pour les scripts utilityProcess

### Documentation

- Mise à jour complète de la documentation (ARCHITECTURE.md, DEVELOPMENT.md, FEATURES.md, etc.)
- Documentation de la refactorisation de l'organisation des composants
- Documentation de la gestion des listeners IPC
- Documentation de l'affichage des messages de console
- Documentation du système de menu dynamique
