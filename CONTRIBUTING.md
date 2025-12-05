# Guide de contribution

Ce document contient toutes les informations nécessaires pour développer et contribuer au projet EcoindexApp.

## Technologies

- **Electron Forge** - Build tooling for Electron applications
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **Changeset** - Version management and changelog generation

## Prérequis

- Node.js 22 ou supérieur (version définie dans `.nvmrc`)
- npm ou yarn
- Pour macOS : Certificats Apple Developer (pour la signature)

## Installation

```bash
npm install
```

## Développement

Démarrer l'application en mode développement :

```bash
npm start
```

## Building

### Build local

Build l'application pour votre plateforme actuelle :

```bash
npm run package
```

Build les installateurs pour toutes les plateformes :

```bash
npm run make
```

**Note:** Par défaut, Electron Forge build pour l'architecture de votre machine. Pour builder pour Mac Intel et ARM depuis un Mac :
- Sur Mac ARM : buildera automatiquement pour ARM64, utilisez `--arch=x64,arm64` pour les deux
- Sur Mac Intel : buildera automatiquement pour x64, utilisez `--arch=x64,arm64` pour les deux

Exemple pour builder pour les deux architectures Mac :
```bash
npm run make -- --arch=x64,arm64
```

### Création de DMG pour macOS

Après le build, vous pouvez créer un fichier DMG pour la distribution macOS :

```bash
npm run make:dmg
```

Cette commande va :
1. Build l'application (`npm run make`)
2. Extraire le fichier ZIP
3. Créer un DMG en utilisant les outils natifs macOS (`hdiutil`)

Le DMG sera créé dans `out/make/zip/darwin/{arch}/` à côté du fichier ZIP.

**Note:** La création du DMG utilise les outils natifs macOS et ne nécessite aucune dépendance externe. Le package `@electron-forge/maker-dmg` est désactivé en raison de problèmes de compatibilité avec Node.js 22.

## Code Signing (macOS uniquement)

### Configuration locale

Pour signer l'application macOS localement :

1. Copier le fichier d'environnement exemple :
   ```bash
   cp .env.example .env
   ```

2. Éditer `.env` et remplir vos identifiants Apple Developer :
   ```env
   APPLE_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
   APPLE_ID="your-apple-id@example.com"
   APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"
   APPLE_TEAM_ID="YOUR_TEAM_ID"
   ```

3. Builder l'application :
   ```bash
   npm run make
   ```

**Note:** 
- Le fichier `.env` est ignoré par git pour des raisons de sécurité
- Les builds Windows et Linux ne sont pas signés
- Si vous ne remplissez pas les identifiants, l'app sera buildée mais ne sera pas signée/notarisée

### Configuration GitHub Actions

Pour les releases GitHub Actions, tous les secrets de signature doivent être configurés dans les paramètres du dépôt (Settings > Secrets and variables > Actions) :

- `APPLE_IDENTITY`: Nom du certificat Developer ID Application (ex: "Developer ID Application: Your Name (TEAM_ID)")
- `APPLE_ID`: Email Apple ID
- `APPLE_APP_SPECIFIC_PASSWORD`: Mot de passe spécifique à l'application (créé sur https://appleid.apple.com/account/manage)
- `APPLE_TEAM_ID`: Team ID Apple Developer
- `APPLE_APPLICATION_CERT`: Certificat .p12 encodé en base64
- `APPLE_APPLICATION_CERT_PASSWORD`: Mot de passe utilisé lors de l'export du .p12

#### Obtenir le certificat Apple Developer

**Pour GitHub Actions, vous devez exporter votre certificat :**

1. **Ouvrir Keychain Access** sur votre Mac
2. **Trouver votre certificat** : Cherchez "Developer ID Application: Votre Nom (TEAM_ID)"
3. **Exporter le certificat** :
   - Clic droit sur le certificat
   - Sélectionner "Exporter [Nom du certificat]"
   - Choisir le format : **Personal Information Exchange (.p12)**
   - Choisir un emplacement et enregistrer
   - **Définir un mot de passe** quand demandé (retenez ce mot de passe !)
4. **Encoder le certificat en base64** :
   ```bash
   base64 -i /chemin/vers/votre/certificate.p12 | pbcopy
   ```
   Cette commande encode le fichier .p12 en base64 et copie le résultat dans le presse-papiers
5. **Configurer les secrets GitHub** :
   - `APPLE_APPLICATION_CERT`: Coller le certificat encodé en base64 (depuis le presse-papiers)
   - `APPLE_APPLICATION_CERT_PASSWORD`: Le mot de passe que vous avez défini lors de l'export du .p12

**Important :** Le certificat base64 doit être sur une seule ligne continue, sans retours à la ligne ni espaces.

Le build **échouera** si les identifiants de signature ne sont pas correctement configurés.

## Gestion de version avec Changeset

Ce projet utilise [Changesets](https://github.com/changesets/changesets) pour la gestion de version.

### Créer un changeset

Quand vous faites des changements qui doivent être publiés, créez un changeset :

```bash
npm run changeset
```

Cela vous demandera de :
1. Sélectionner les packages qui ont changé
2. Sélectionner le type de changement (major, minor, patch)
3. Écrire un résumé des changements

### Workflows GitHub Actions

Le projet utilise des workflows GitHub Actions pour les releases automatisées :

1. **Créer un changeset** : Quand vous faites des changements, créez un changeset :
   ```bash
   npm run changeset
   ```

2. **Ouvrir une PR** : Poussez vos changements avec le changeset vers une branche et ouvrez une PR vers `main`.

3. **PR de version automatique** : Quand la PR est mergée dans `main`, le workflow Changeset va :
   - Détecter le changeset
   - Créer une nouvelle PR intitulée "chore: version packages" avec les bumps de version
   - Mettre à jour le changelog

4. **Revoir et merger** : Revoir la PR de version et la merger dans `main`.

5. **Release automatique** : Après le merge de la PR de version, le workflow Release va :
   - Détecter le changement de version (message de commit "chore: version packages")
   - Builder l'application pour toutes les plateformes (Linux, Windows, macOS Intel, macOS ARM)
   - Créer les fichiers DMG pour macOS
   - Créer une Release GitHub avec tous les artifacts
   - Optionnellement publier sur npm (si `NPM_TOKEN` est configuré)

**Versioning manuel** (pour les tests locaux) :

```bash
npm run version-packages
```

## Linting

Linter le code :

```bash
npm run lint
```

Corriger automatiquement les erreurs de linting :

```bash
npm run lint:fix
```

## Structure du projet

```
.
├── src/
│   ├── main/              # Processus principal Electron
│   │   ├── main.ts        # Point d'entrée principal
│   │   └── preload.ts     # Script preload
│   ├── renderer/          # Processus renderer React
│   │   └── main_window/   # Fenêtre principale
│   ├── components/        # Composants React
│   │   └── ui/           # Composants Shadcn/ui
│   └── lib/              # Fonctions utilitaires
├── .changeset/           # Configuration Changeset
├── .github/              # Workflows GitHub Actions
├── assets/               # Icônes et ressources
├── scripts/              # Scripts utilitaires
│   └── create-dmg.js    # Script de création DMG
└── forge.config.js       # Configuration Electron Forge
```

## Workflows GitHub Actions

### Changeset

- **Déclencheur** : Push vers `main`
- **Action** : Détecte les changesets et crée une PR de version
- **Fichier** : `.github/workflows/changeset.yml`

### Release

- **Déclencheur** : Push vers `main` (uniquement si le commit contient "chore: version packages")
- **Action** : Build l'application pour toutes les plateformes et crée une Release GitHub
- **Fichier** : `.github/workflows/release.yml`

## Secrets GitHub requis

Pour que les workflows fonctionnent correctement, les secrets suivants doivent être configurés dans GitHub (Settings > Secrets and variables > Actions) :

**Requis pour la signature macOS :**
- `APPLE_IDENTITY`: Nom du certificat Developer ID Application
- `APPLE_ID`: Email Apple ID
- `APPLE_APP_SPECIFIC_PASSWORD`: Mot de passe spécifique à l'application
- `APPLE_TEAM_ID`: Team ID Apple Developer

**Optionnel pour la signature avec certificat .p12 :**
- `APPLE_APPLICATION_CERT`: Certificat .p12 encodé en base64 (optionnel)
- `APPLE_APPLICATION_CERT_PASSWORD`: Mot de passe du certificat (optionnel)

**Optionnel :**
- `NPM_TOKEN`: Token npm pour publier sur npm (optionnel)

**Note:** Si vous n'utilisez pas de certificat .p12 (via `APPLE_APPLICATION_CERT`), l'application sera signée avec l'identité configurée dans `APPLE_IDENTITY` si elle est disponible dans le keychain GitHub Actions. Si aucun certificat n'est configuré, l'application sera buildée mais non signée.

## Permissions GitHub Actions

Pour que le workflow Changeset puisse créer des PRs, vous devez configurer les permissions dans GitHub :

1. Allez dans **Settings > Actions > General**
2. Section **"Workflow permissions"**
3. Sélectionnez **"Read and write permissions"**
4. Cochez **"Allow GitHub Actions to create and approve pull requests"**
5. Cliquez sur **"Save"**

## License

AGPL-3.0

