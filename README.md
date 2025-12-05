# EcoindexApp

An application to measure the ecological impact of a website with Lighthouse and Ecoindex.

## Technologies

- **Electron Forge** - Build tooling for Electron applications
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **Changeset** - Version management and changelog generation

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the application in development mode:

```bash
npm start
```

### Building

Build the application for your current platform:

```bash
npm run package
```

Build installers for all platforms:

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

### Creating DMG for macOS

After building, you can create a DMG file for macOS distribution:

```bash
npm run make:dmg
```

This command will:
1. Build the application (`npm run make`)
2. Extract the ZIP file
3. Create a DMG using macOS native tools (`hdiutil`)

The DMG will be created in `out/make/zip/darwin/{arch}/` alongside the ZIP file.

**Note:** The DMG creation uses native macOS tools and doesn't require any external dependencies. The `@electron-forge/maker-dmg` package is disabled due to compatibility issues with Node.js 22.

### Code Signing (macOS only)

To sign the macOS application:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Apple Developer credentials:
   ```env
   APPLE_IDENTITY="Developer ID Application: Your Name (TEAM_ID)"
   APPLE_ID="your-apple-id@example.com"
   APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"
   APPLE_TEAM_ID="YOUR_TEAM_ID"
   ```

3. Build the application:
   ```bash
   npm run make
   ```

**Note:** 
- The `.env` file is ignored by git for security reasons
- Windows and Linux builds are not signed
- If you don't fill in the credentials, the app will build but won't be signed/notarized

## Version Management with Changeset

This project uses [Changesets](https://github.com/changesets/changesets) for version management.

### Creating a changeset

When you make changes that should be released, create a changeset:

```bash
npm run changeset
```

This will prompt you to:
1. Select the packages that changed
2. Select the type of change (major, minor, patch)
3. Write a summary of the changes

### Versioning packages and releases

The project uses GitHub Actions workflows for automated releases:

1. **Creating a changeset**: When you make changes, create a changeset:
   ```bash
   npm run changeset
   ```

2. **Opening a PR**: Push your changes with the changeset to a branch and open a PR to `main`.

3. **Automatic version PR**: When the PR is merged to `main`, the Changeset workflow will:
   - Detect the changeset
   - Create a new PR titled "chore: version packages" with version bumps
   - Update the changelog

4. **Review and merge**: Review the version PR and merge it to `main`.

5. **Automatic release**: After merging the version PR, the Release workflow will:
   - Detect the version change (commit message "chore: version packages")
   - Build the application for all platforms (Linux, Windows, macOS Intel, macOS ARM)
   - Create DMG files for macOS
   - Create a GitHub Release with all artifacts
   - Optionally publish to npm (if `NPM_TOKEN` is configured)

**Manual versioning** (for local testing):

```bash
npm run version-packages
```

**Secrets required for GitHub Actions:**

**Required for macOS signing:**
- `APPLE_IDENTITY`: Developer ID Application certificate name
- `APPLE_ID`: Apple ID email
- `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password
- `APPLE_TEAM_ID`: Apple Developer Team ID

**Optional for macOS signing (if you use certificate files):**
- `APPLE_APPLICATION_CERT`: Base64-encoded .p12 certificate (optional)
- `APPLE_APPLICATION_CERT_PASSWORD`: Certificate password (optional)

**Optional:**
- `NPM_TOKEN`: npm token for publishing to npm (optional)

**Note:** Si vous n'utilisez pas de certificat .p12 (via `APPLE_APPLICATION_CERT`), l'application sera signée avec l'identité configurée dans `APPLE_IDENTITY` si elle est disponible dans le keychain GitHub Actions. Si aucun certificat n'est configuré, l'application sera buildée mais non signée.

## Project Structure

```
.
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Main entry point
│   │   └── preload.ts     # Preload script
│   ├── renderer/          # React renderer process
│   │   └── main_window/   # Main window
│   ├── components/        # React components
│   │   └── ui/           # Shadcn/ui components
│   └── lib/              # Utility functions
├── .changeset/           # Changeset configuration
├── .github/              # GitHub Actions workflows
└── forge.config.js       # Electron Forge configuration
```

## License

AGPL-3.0
