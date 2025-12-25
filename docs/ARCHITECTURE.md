# Architecture technique

## Stack technologique

### Frontend (Renderer Process)

- **React 19.2.1** : Framework UI
- **TypeScript 5.7.2** : Typage statique
- **Tailwind CSS 4.1.17** : Framework CSS utility-first
- **Shadcn/ui** : Composants React de qualité
- **Vite 7.2.6** : Build tool et dev server
- **react-i18next** : Internationalisation React

### Backend (Main Process)

- **Electron 39.2.5** : Framework desktop
- **Node.js 22+** : Runtime requis
- **electron-log 5.4.3** : Système de logging
- **electron-store 11.0.2** : Persistance des données
- **i18next 25.7.1** : Internationalisation (main process)
- **i18next-fs-backend 2.6.1** : Backend fichiers pour i18next
- **electron-updater** : Système de mise à jour automatique (macOS/Windows)

### Build & Tooling

- **Electron Forge 7.10.2** : Build tooling
- **ESLint 9.39.1** : Linter
- **Prettier** : Formateur de code
- **Husky 9.1.7** : Git hooks
- **Changeset 2.27.1** : Gestion de version
- **Babel** : Extraction des clés i18n

## Architecture Electron

L'application suit l'architecture standard Electron avec séparation stricte entre :

- **Main Process** (`src/main/`) : Processus principal Node.js
- **Renderer Process** (`src/renderer/`) : Processus de rendu React
- **Preload Script** (`src/main/preload.ts`) : Script de pont sécurisé

### Sécurité

- `contextIsolation: true` : Isolation du contexte
- `nodeIntegration: false` : Pas d'intégration Node.js directe dans le renderer
- Utilisation de `contextBridge` pour exposer des APIs sécurisées

## Structure du projet

```
EcoindexApp-2025/
├── src/
│   ├── main/                    # Main Process Electron
│   │   ├── main.ts              # Point d'entrée principal
│   │   ├── preload.ts           # Script preload (contextBridge)
│   │   ├── memory.ts            # Gestion de la mémoire (fenêtre principale)
│   │   ├── utils-node.ts       # Utilitaires Node.js
│   │   ├── handlers/            # Handlers de logique métier
│   │   │   ├── Initalization.ts # Orchestrateur d'initialisation
│   │   │   ├── HandleExtractAsarLib.ts
│   │   │   ├── HandleSplashScreen.ts
│   │   │   └── initHandlers/    # Handlers spécifiques d'initialisation
│   │   │       ├── getHomeDir.ts
│   │   │       ├── getWorkDir.ts
│   │   │       ├── IsNodeInstalled.ts
│   │   │       ├── isNodeVersionOK.ts
│   │   │       ├── puppeteerBrowser_isInstalled.ts
│   │   │       └── puppeteerBrowser_installation.ts
│   │   └── utils/               # Utilitaires
│   │       ├── SendMessageToFrontConsole.ts
│   │       └── SendMessageToFrontLog.ts
│   ├── renderer/                # Renderer Process React
│   │   └── main_window/
│   │       ├── App.tsx          # Composant principal
│   │       ├── main.tsx         # Point d'entrée React
│   │       ├── index.css        # Styles globaux
│   │       └── preload.d.ts     # Types TypeScript pour preload
│   ├── components/              # Composants React
│   │   ├── LanguageSwitcher.tsx
│   │   └── ui/                  # Composants Shadcn/ui
│   │       ├── button.tsx
│   │       └── card.tsx
│   ├── configs/                 # Configurations
│   │   ├── i18next.config.ts    # i18n pour main process
│   │   └── i18nResources.ts     # i18n pour renderer process
│   ├── locales/                 # Fichiers de traduction
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── fr/
│   │       └── translation.json
│   ├── class/                   # Classes TypeScript
│   │   ├── ConfigData.ts
│   │   ├── InitalizationData.ts
│   │   └── LinuxUpdate.ts
│   ├── shared/                  # Code partagé
│   │   └── constants.ts         # Constantes et configuration par défaut
│   ├── extraResources/          # Ressources packagées
│   │   ├── lib.asar             # Archive des scripts
│   │   └── md/                  # Contenu markdown
│   ├── types.d.ts               # Types TypeScript globaux
│   ├── interface.d.ts           # Interfaces TypeScript
│   └── lib/                     # Scripts Node.js (développement)
│       ├── browser_isInstalled.mjs
│       ├── browser_install.mjs
│       ├── courses_index.mjs
│       └── package.json
├── docs/                        # Documentation
├── .github/                     # GitHub Actions
│   └── workflows/
│       ├── changeset.yml
│       └── release.yml
├── assets/                      # Ressources build
│   └── app-ico/                 # Icônes application
├── scripts/                     # Scripts utilitaires
│   └── create-dmg.js
├── forge.config.js              # Configuration Electron Forge
├── vite.*.config.ts             # Configurations Vite
├── eslint.config.js             # Configuration ESLint
├── prettier.config.mjs          # Configuration Prettier
├── .babelrc                     # Configuration Babel (i18n)
├── package.json
└── README.md
```

## Flux d'exécution

### Démarrage de l'application

1. **Main Process démarre** (`src/main/main.ts`)
    - Initialisation de `electron-log`
    - Configuration des chemins (APP_ROOT, etc.)
    - Création du menu Electron avec sélection de langue
    - Création de la fenêtre principale

2. **Fenêtre principale se charge**
    - En développement : chargement depuis Vite dev server (`http://localhost:5173`)
    - En production : chargement depuis fichier HTML packagé
    - Ouverture automatique des DevTools en développement

3. **Événement `did-finish-load`**
    - Délai de 1 seconde
    - Appel automatique de `initialization()`

4. **Processus d'initialisation**
    - Initialisation d'i18next (chargement des traductions)
    - Vérifications séquentielles (Node.js, dossiers, Puppeteer)
    - Messages envoyés au renderer via IPC
    - Finalisation et marquage comme initialisée

### Communication Main ↔ Renderer

```
Main Process                    Renderer Process
     │                                │
     │── IPC: initialization-messages ──>│
     │                                │  (Affichage modal)
     │<── IPC: initialization-app ────│
     │                                │
     │── IPC: host-informations-back ──>│
     │                                │  (Mise à jour UI)
     │<── IPC: change-language ───────│
     │                                │
     │── IPC: language-changed ───────>│
     │                                │  (Mise à jour i18n)
```

## Gestion des ressources

### Structure des ressources

```
src/extraResources/
├── lib.asar          # Archive ASAR contenant les scripts Node.js
└── md/
    ├── splash-content.en.md
    └── splash-content.fr.md
```

### Chemin des ressources

- **Développement** : `src/extraResources/`
- **Production** : `process.resourcesPath` (configuré dans `forge.config.js`)

### Extraction ASAR (Windows)

Sur Windows, `lib.asar` est automatiquement extrait vers `lib/` car les archives ASAR ne peuvent pas être lues directement par les processus utilitaires.

### Scripts utilitaires

Les scripts dans `lib/` sont exécutés via `utilityProcess` :

- `browser_isInstalled.mjs` : Vérifie si le navigateur Puppeteer est installé
- `browser_install.mjs` : Installe le navigateur Puppeteer
- `courses_index.mjs` : Gère l'indexation des parcours

#### Chemin des scripts

- **Développement** : `process.cwd()/lib/`
- **Production** :
    - Windows : `process.resourcesPath/../lib/` (après extraction)
    - macOS/Linux : `process.resourcesPath/lib.asar/`

## Points techniques importants

### Chemin des ressources

- En développement : `process.cwd()` ou `APP_ROOT`
- En production : `process.resourcesPath` (configuré par Electron Forge)

### Initialisation i18next

- Asynchrone dans le main process
- Nécessite `await initializeI18n()` avant utilisation
- Chargement explicite du namespace `translation`

### Scripts utilitaires

- Exécutés via `utilityProcess` (isolés du main process)
- Communication via messages IPC
- Gestion des erreurs et logs stdout/stderr

### Logging

- `electron-log` pour les logs structurés
- Fichier de log : `~/Library/Logs/ecoindex-app/main.log` (macOS)
- Niveau debug activé pour le développement
