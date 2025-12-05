import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
// import { MakerDMG } from '@electron-forge/maker-dmg'; // Désactivé : appdmg nécessite des binaires natifs incompatibles avec Node.js 22
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import { readFileSync } from 'node:fs';

// Charger les variables d'environnement depuis .env
loadEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
const { version } = packageJson;

// Vérifier si les variables de signature sont définies
const hasSigningConfig = 
  process.env.APPLE_IDENTITY && 
  process.env.APPLE_IDENTITY.trim() !== '' &&
  process.env.APPLE_IDENTITY.includes('Developer ID');

const config = {
  packagerConfig: {
    asar: true,
    name: 'EcoindexApp',
    executableName: process.platform === 'linux' ? 'ecoindex-app' : 'EcoindexApp',
    appBundleId: 'io.greenit.ecoindex-ligthouse',
    appCategoryType: 'public.app-category.developer-tools',
    appCopyright: 'Copyright 2024-2030 Association Green IT',
    darwinDarkModeSupport: true,
    icon: path.resolve(__dirname, 'assets', 'app-ico'),
    // Configuration pour la signature Mac uniquement (seulement si configuré)
    ...(hasSigningConfig && {
      osxSign: {
        identity: process.env.APPLE_IDENTITY,
        optionsForFile: () => ({
          entitlements: path.resolve(__dirname, 'entitlements.mac.plist'),
          hardenedRuntime: true,
        }),
      },
      osxNotarize: process.env.APPLE_ID && process.env.APPLE_APP_SPECIFIC_PASSWORD && process.env.APPLE_TEAM_ID
        ? {
            tool: 'notarytool',
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
            teamId: process.env.APPLE_TEAM_ID,
          }
        : undefined,
    }),
    // Métadonnées Windows
    win32metadata: {
      CompanyName: 'Association Green IT',
      OriginalFilename: 'Ecoindex',
      FileDescription: 'An application to measure the ecological impact of a website with LightHouse and Ecoindex.',
      ProductName: 'EcoindexApp',
    },
  },
  rebuildConfig: {},
  makers: [
    // ZIP pour toutes les plateformes
    new MakerZIP({}, ['darwin', 'linux', 'win32']),
    // DMG pour macOS (Intel et ARM) - Désactivé car appdmg nécessite des binaires natifs
    // qui ne compilent pas avec Node.js 22+ et Python 3.13+ (voir https://github.com/electron/forge/issues/2807 et #3717)
    // Solution alternative : utiliser le script scripts/create-dmg.js qui utilise hdiutil (outil natif macOS)
    // Pour créer un DMG, utilisez : npm run make:dmg
    // new MakerDMG(
    //   {
    //     format: 'ULFO',
    //     icon: path.resolve(__dirname, 'assets', 'app-ico.icns'),
    //     overwrite: true,
    //   },
    //   ['darwin']
    // ),
    // RPM pour Linux
    new MakerRpm(
      {
        options: {
          name: 'ecoindex-app',
          homepage: 'https://github.com/cnumr/EcoindexApp',
        },
      },
      ['linux']
    ),
    // DEB pour Linux
    new MakerDeb(
      {
        options: {
          name: 'ecoindex-app',
          categories: ['Utility'],
          maintainer: 'Renaud Héluin',
          homepage: 'https://github.com/cnumr/EcoindexApp',
        },
      },
      ['linux']
    ),
    // Squirrel pour Windows
    new MakerSquirrel({
      name: 'ecoindex-app',
      setupExe: `ecoindex-app-${version}-win32-setup.exe`,
      setupIcon: path.resolve(__dirname, 'assets', 'app-ico.ico'),
      authors: 'Renaud Heluin',
      description: 'An application to measure the ecological impact of a website with LightHouse and Ecoindex.',
      language: 1033,
    }),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/main/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;

