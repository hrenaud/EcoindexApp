# Structure du projet

## Arborescence complète

```
EcoindexApp-2025/
├── src/                          # Code source
│   ├── main/                     # Main Process Electron
│   │   ├── main.ts              # Point d'entrée principal
│   │   ├── preload.ts           # Script preload (contextBridge)
│   │   ├── memory.ts            # Gestion de la mémoire (fenêtre principale)
│   │   ├── utils-node.ts        # Utilitaires Node.js
│   │   ├── handlers/            # Handlers de logique métier
│   │   │   ├── Initalization.ts # Orchestrateur d'initialisation
│   │   │   ├── HandleExtractAsarLib.ts  # Extraction ASAR (Windows)
│   │   │   ├── HandleSplashScreen.ts    # Gestion du splash screen
│   │   │   └── initHandlers/    # Handlers spécifiques d'initialisation
│   │   │       ├── getHomeDir.ts        # Récupération du dossier home
│   │   │       ├── getWorkDir.ts        # Récupération du dossier de travail
│   │   │       ├── IsNodeInstalled.ts   # Vérification Node.js
│   │   │       ├── isNodeVersionOK.ts  # Vérification version Node.js
│   │   │       ├── puppeteerBrowser_isInstalled.ts    # Vérification Puppeteer
│   │   │       └── puppeteerBrowser_installation.ts   # Installation Puppeteer
│   │   └── utils/               # Utilitaires
│   │       ├── SendMessageToFrontConsole.ts
│   │       └── SendMessageToFrontLog.ts
│   ├── renderer/                 # Renderer Process React
│   │   └── main_window/
│   │       ├── App.tsx           # Composant principal React
│   │       ├── main.tsx          # Point d'entrée React
│   │       ├── index.css         # Styles globaux
│   │       └── preload.d.ts      # Types TypeScript pour preload
│   ├── components/               # Composants React
│   │   ├── InformationPopin.tsx  # Popin d'initialisation
│   │   ├── LanguageSwitcher.tsx # Sélecteur de langue
│   │   └── ui/                  # Composants Shadcn/ui
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── progress.tsx     # Barre de progression
│   ├── configs/                  # Configurations
│   │   ├── i18next.config.ts    # i18n pour main process
│   │   └── i18nResources.ts     # i18n pour renderer process
│   ├── locales/                  # Fichiers de traduction
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── fr/
│   │       └── translation.json
│   ├── class/                    # Classes TypeScript
│   │   ├── ConfigData.ts         # Données de configuration
│   │   ├── InitalizationData.ts # Données d'initialisation
│   │   └── LinuxUpdate.ts        # Mise à jour Linux
│   ├── shared/                   # Code partagé
│   │   └── constants.ts          # Constantes et configuration par défaut
│   ├── extraResources/           # Ressources packagées
│   │   ├── lib.asar              # Archive des scripts Node.js
│   │   └── md/                   # Contenu markdown
│   │       ├── splash-content.en.md
│   │       └── splash-content.fr.md
│   ├── lib/                      # Scripts Node.js (développement)
│   │   ├── browser_isInstalled.mjs
│   │   ├── browser_install.mjs
│   │   ├── courses_index.mjs
│   │   ├── package.json
│   │   └── node_modules/
│   ├── types.d.ts                # Types TypeScript globaux
│   ├── interface.d.ts            # Interfaces TypeScript
│   ├── declarations.d.ts         # Déclarations globales
│   └── exportHelpers.ts          # Helpers d'export (legacy)
├── docs/                         # Documentation
│   ├── README.md                 # Index de la documentation
│   ├── ARCHITECTURE.md           # Architecture technique
│   ├── FEATURES.md               # Fonctionnalités
│   ├── DEVELOPMENT.md            # Guide de développement
│   ├── BUILD.md                  # Build et packaging
│   ├── API.md                    # API et IPC
│   └── STRUCTURE.md              # Ce fichier
├── .github/                      # GitHub Actions
│   └── workflows/
│       ├── changeset.yml         # Workflow Changeset
│       └── release.yml           # Workflow Release
├── .husky/                       # Git hooks
│   ├── pre-commit                # Hook pre-commit
│   └── commit-msg                # Hook commit-msg
├── assets/                       # Ressources build
│   └── app-ico/                  # Icônes application
│       ├── icon.icns             # macOS
│       └── icon.ico              # Windows
├── scripts/                      # Scripts utilitaires
│   └── create-dmg.js             # Création DMG macOS
├── .changeset/                   # Configuration Changeset
│   └── config.json
├── forge.config.js               # Configuration Electron Forge
├── vite.main.config.ts           # Configuration Vite (main)
├── vite.preload.config.ts        # Configuration Vite (preload)
├── vite.renderer.config.ts       # Configuration Vite (renderer)
├── eslint.config.js              # Configuration ESLint
├── prettier.config.mjs           # Configuration Prettier
├── .babelrc                      # Configuration Babel (i18n)
├── .prettierignore               # Fichiers ignorés par Prettier
├── .gitignore                    # Fichiers ignorés par Git
├── .nvmrc                        # Version Node.js
├── package.json                  # Dépendances et scripts
├── tsconfig.json                 # Configuration TypeScript
├── tsconfig.node.json            # Configuration TypeScript (Node)
├── tailwind.config.js            # Configuration Tailwind CSS
├── postcss.config.js             # Configuration PostCSS
└── README.md                     # README principal
```

## Description des dossiers et fichiers importants

### `src/main/`

**Main Process Electron** - Processus principal Node.js qui gère :

- Création des fenêtres
- Communication IPC
- Gestion du menu
- Initialisation de l'application
- Logging

**Fichiers clés** :

- `main.ts` : Point d'entrée, création de la fenêtre, gestion du menu
- `preload.ts` : Script de pont sécurisé via `contextBridge`
- `memory.ts` : Gestion de la référence à la fenêtre principale
- `handlers/Initalization.ts` : Orchestrateur du processus d'initialisation

### `src/renderer/`

**Renderer Process React** - Interface utilisateur React.

**Fichiers clés** :

- `main.tsx` : Point d'entrée React, initialisation i18n
- `App.tsx` : Composant principal de l'application
- `index.css` : Styles globaux Tailwind CSS avec styles personnalisés
- `preload.d.ts` : Types TypeScript pour les APIs exposées

### `src/components/`

**Composants React réutilisables**.

- `InformationPopin.tsx` : Popin modal pour afficher les messages d'initialisation
- `LanguageSwitcher.tsx` : Sélecteur de langue
- `ui/` : Composants Shadcn/ui (button, card, progress, etc.)

### `src/configs/`

**Configurations** :

- `i18next.config.ts` : Configuration i18n pour le main process (avec `i18next-fs-backend`)
- `i18nResources.ts` : Configuration i18n pour le renderer process (avec `i18next-resources-to-backend`)

### Fichiers de configuration racine

**Configurations du projet** :

- `tailwind.config.js` : Configuration Tailwind CSS (couleurs personnalisées, plugins, thème)
- `postcss.config.js` : Configuration PostCSS (plugins Tailwind et Autoprefixer)

### `src/locales/`

**Fichiers de traduction JSON** :

- `en/translation.json` : Traductions anglaises
- `fr/translation.json` : Traductions françaises

### `src/class/`

**Classes TypeScript** :

- `ConfigData.ts` : Transport de données de configuration
- `InitalizationData.ts` : Transport de données d'initialisation
- `LinuxUpdate.ts` : Gestion des mises à jour Linux

### `src/shared/`

**Code partagé entre main et renderer** :

- `constants.ts` : Constantes, canaux IPC, configuration par défaut

### `src/extraResources/`

**Ressources packagées avec l'application** :

- `lib.asar` : Archive des scripts Node.js (créée via `npm run asar:pack:lib`)
- `md/` : Fichiers markdown (splash screen, etc.)

### `src/lib/`

**Scripts Node.js exécutés via `utilityProcess`** :

- `browser_isInstalled.mjs` : Vérifie si Puppeteer est installé
- `browser_install.mjs` : Installe Puppeteer
- `courses_index.mjs` : Gère l'indexation des parcours
- `package.json` : Dépendances des scripts (Lighthouse, etc.)

### `docs/`

**Documentation du projet** :

- `README.md` : Index de la documentation
- `ARCHITECTURE.md` : Architecture technique
- `FEATURES.md` : Fonctionnalités
- `DEVELOPMENT.md` : Guide de développement
- `BUILD.md` : Build et packaging
- `API.md` : API et IPC
- `STRUCTURE.md` : Ce fichier

### Fichiers de configuration

- `forge.config.js` : Configuration Electron Forge (build, packaging, signature)
- `vite.*.config.ts` : Configurations Vite pour chaque build
- `eslint.config.js` : Configuration ESLint (flat config)
- `prettier.config.mjs` : Configuration Prettier
- `.babelrc` : Configuration Babel pour l'extraction i18n
- `tsconfig.json` : Configuration TypeScript principale
- `tsconfig.node.json` : Configuration TypeScript pour Node.js

### Fichiers de workflow

- `.github/workflows/` : GitHub Actions (changeset, release)
- `.husky/` : Git hooks (pre-commit, commit-msg)
- `.changeset/` : Configuration Changeset

## Fichiers générés (non versionnés)

Ces fichiers/dossiers sont générés et ne doivent pas être versionnés :

- `.vite/` : Build de développement
- `out/` : Build de production
- `dist/` : Build du renderer
- `dist-electron/` : Build du main process
- `node_modules/` : Dépendances npm
- `.babel-temp/` : Fichiers temporaires Babel

Ils sont listés dans `.gitignore`.
