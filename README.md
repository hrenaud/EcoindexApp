# EcoindexApp

An application to measures the ecological impact of a website with LightHouse and Ecoindex.

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

### Versioning packages

After changesets are merged, the GitHub Actions workflow will automatically:
1. Create a PR with version bumps
2. Merge the PR
3. Publish to npm (if configured)

You can also manually version packages:

```bash
npm run version-packages
```

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
