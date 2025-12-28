# ecoindex-app

## 0.2.5

### Patch Changes

- f3b3376: ## Corrections du workflow GitHub Actions
    - **Correction du pattern de fichiers** : Suppression du pattern `artifacts/**/*Setup.exe` (avec S majuscule) qui ne correspondait à aucun fichier et générait un warning. Le fichier Windows est `setup.exe` (minuscule).
    - **Ajout de `fail_on_unmatched_files: false`** : Permet au workflow de continuer même si certains patterns ne correspondent à aucun fichier, évitant les erreurs lors de la création de release GitHub.
    - **Ajout de `overwrite_files: false`** : Empêche l'action de tenter de mettre à jour des assets existants, ce qui causait l'erreur "Not Found" lors de l'upload de fichiers dupliqués. Le paramètre `overwrite` n'existe pas dans cette action, c'est `overwrite_files` qui doit être utilisé.
    - **Ajout d'une étape de déduplication** : Ajout d'une étape "Remove duplicate files" qui supprime les fichiers en double avant l'upload. Les patterns glob trouvaient les mêmes fichiers dans plusieurs dossiers d'artifacts (ex: `macos-intel-artifacts` et `macos-arm-artifacts`), causant des tentatives d'upload multiples du même fichier et l'erreur "Not Found".

## 0.2.4

### Patch Changes

- f3b3376: ## Corrections du workflow GitHub Actions
    - **Correction du pattern de fichiers** : Suppression du pattern `artifacts/**/*Setup.exe` (avec S majuscule) qui ne correspondait à aucun fichier et générait un warning. Le fichier Windows est `setup.exe` (minuscule).
    - **Ajout de `fail_on_unmatched_files: false`** : Permet au workflow de continuer même si certains patterns ne correspondent à aucun fichier, évitant les erreurs lors de la création de release GitHub.
    - **Ajout de `overwrite_files: false`** : Empêche l'action de tenter de mettre à jour des assets existants, ce qui causait l'erreur "Not Found" lors de l'upload de fichiers dupliqués. Le paramètre `overwrite` n'existe pas dans cette action, c'est `overwrite_files` qui doit être utilisé.

## 0.2.3

### Patch Changes

- bdc3598: ## Corrections du workflow GitHub Actions
    - **Correction du pattern de fichiers** : Suppression du pattern `artifacts/**/*Setup.exe` (avec S majuscule) qui ne correspondait à aucun fichier et générait un warning. Le fichier Windows est `setup.exe` (minuscule).
    - **Ajout de `fail_on_unmatched_files: false`** : Permet au workflow de continuer même si certains patterns ne correspondent à aucun fichier, évitant les erreurs lors de la création de release GitHub.
    - **Ajout de `overwrite: false`** : Empêche l'action de tenter de mettre à jour des assets existants, ce qui causait l'erreur "Not Found" lors de l'upload de fichiers dupliqués.

## 0.2.2

### Patch Changes

- 185f935: ## Optimisation CI/CD
    - **Optimisation du workflow de build** : Ajout de la variable d'environnement `PUPPETEER_SKIP_DOWNLOAD: true` dans le step "Install dependencies" du workflow GitHub Actions pour éviter le téléchargement inutile de Puppeteer pendant les builds CI/CD. Cela accélère significativement le processus de build sur toutes les plateformes (Linux, Windows, macOS).

## 0.2.1

### Patch Changes

- 0403db5: ## Corrections et améliorations

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

## 0.2.0

### Minor Changes

- 23bfa5c: ## Résumé des modifications depuis décembre 2025

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

## 0.1.16

### Patch Changes

- 7ce3b5e: add language switcher
- 8c929e0: init electron-log
- 310ab89: add i18n
- 3a45146: add prettier
- 67a881e: add accessibility lint check
- fecd551: add lib
- 7fff557: more of electron-store
- e903350: add commitlint, eslint-plugin-import et @ecocode/eslint-plugin
- 7d15e4a: Mise à jour de CONTRIBUTING.md pour clarifier le format exact de APPLE_IDENTITY

## 0.1.15

### Patch Changes

- 20346d7: Correction du build Windows en spécifiant explicitement bash comme shell

## 0.1.14

### Patch Changes

- 18fb861: Amélioration des logs de debug pour comprendre pourquoi la signature est adhoc

## 0.1.13

### Patch Changes

- f081ddd: Correction de la syntaxe des variables d'environnement conditionnelles dans GitHub Actions

## 0.1.12

### Patch Changes

- 8921895: Correction des builds Windows et macOS Intel : conditionnement des variables d'environnement macOS et amélioration de la vérification de signature

## 0.1.11

### Patch Changes

- bc5e4ff: Correction des builds Linux et Windows en conditionnant les commandes macOS

## 0.1.10

### Patch Changes

- bcf95b8: Correction de la détection de la configuration de signature et amélioration des logs de debug

## 0.1.9

### Patch Changes

- fe63d57: Amélioration de la vérification du certificat et ajout de logs pour diagnostiquer le problème de signature

## 0.1.8

### Patch Changes

- 009f3ad: Ajout de logs de debug pour diagnostiquer pourquoi la signature n'est pas appliquée

## 0.1.7

### Patch Changes

- 2012e56: Correction du chemin de recherche de l'application pour la vérification de signature

## 0.1.6

### Patch Changes

- 0a16cb7: Ajout du fichier CONTRIBUTING.md avec toutes les informations de développement et simplification du README pour l'utilisation
- beaecfb: Correction de l'extraction ZIP dans create-dmg.js pour préserver la signature et ajout de vérifications de signature dans le workflow

## 0.1.5

### Patch Changes

- ccaca4e: Correction du script create-dmg.js pour préserver la signature macOS lors de la copie
- 529de72: Réorganisation de l'ordre des imports dans create-dmg.js

## 0.1.4

### Patch Changes

- 7fe4e2a: Ajout d'instructions détaillées pour obtenir et encoder le certificat macOS
- 9f9bff1: Ajout de documentation pour ouvrir les applications non signées sur macOS
- f660ba3: Exiger la signature macOS dans le workflow GitHub Actions

## 0.1.3

### Patch Changes

- 25cc9fc: Correction du workflow changeset pour éviter qu'il s'exécute sur les commits de version

## 0.1.2

### Patch Changes

- e692fa1: Correction du workflow release pour qu'il ne se déclenche qu'après le merge de la PR de version créée par changeset

## 0.1.1

### Patch Changes

- 598956b: Correction d'une faute de frappe dans la description du README
- 7147b53: Test du processus complet de changeset et release
- b835027: Test du workflow changeset et release
