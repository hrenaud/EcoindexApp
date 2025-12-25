# Guide de développement

## Prérequis

- **Node.js 22+** : Version définie dans `.nvmrc`
- **npm** ou **yarn**
- **Git**

## Installation

```bash
# Installer les dépendances principales
npm install

# Installer les dépendances des scripts utilitaires
cd lib && npm ci && cd ..
```

## Scripts de développement

### Démarrage

```bash
npm start
```

Démarre l'application en mode développement avec :

- Hot reload pour le renderer (Vite)
- DevTools automatiquement ouverts
- Logs de debug activés

### Linting et formatage

```bash
# Vérifier le code
npm run lint

# Corriger automatiquement
npm run lint:fix

# Formater avec Prettier
npm run format
```

### Extraction des clés i18n

```bash
npm run localize:generate
```

Extrait les clés de traduction depuis le code source et les ajoute aux fichiers de traduction.

### Mise à jour des packages

```bash
npm run update-packages
```

Met à jour les packages Lighthouse dans le dossier `lib/`.

## Structure du code

### Conventions de code

- **TypeScript strict** : Typage strict activé
- **ESLint + Prettier** : Formatage automatique
- **Conventional Commits** : Format standardisé des commits
- **Accessibilité** : Règles ESLint jsx-a11y (désactivées pour Shadcn/ui)

### Organisation des fichiers

- **Main Process** : `src/main/`
- **Renderer Process** : `src/renderer/`
- **Composants partagés** : `src/components/`
- **Configurations** : `src/configs/`
- **Traductions** : `src/locales/`
- **Classes/Interfaces** : `src/class/`, `src/types.d.ts`, `src/interface.d.ts`
- **Constantes** : `src/shared/constants.ts`

### Gestion des erreurs

- Utilisation de `electron-log` pour tous les logs
- Try-catch autour des opérations critiques
- Messages d'erreur traduits via i18n
- Affichage d'erreurs dans l'UI avec liens d'aide

## Git hooks

### pre-commit

Exécute automatiquement :

- ESLint sur les fichiers modifiés
- Prettier pour formater le code

Les fichiers sont automatiquement formatés avant le commit.

### commit-msg

Valide le format des messages de commit selon **Conventional Commits** :

- `feat:` : Nouvelle fonctionnalité
- `fix:` : Correction de bug
- `docs:` : Documentation
- `style:` : Formatage
- `refactor:` : Refactoring
- `test:` : Tests
- `chore:` : Maintenance

Exemple :

```
feat: add language switcher component
fix: resolve i18n initialization issue
docs: update API documentation
```

## Workflow de contribution

1. **Créer une branche** depuis `main`

    ```bash
    git checkout -b feat/ma-fonctionnalite
    ```

2. **Développer et tester**
    - Écrire le code
    - Tester manuellement
    - Vérifier avec `npm run lint`

3. **Créer un changeset** (si changement de version)

    ```bash
    npm run changeset
    ```

4. **Commit**

    ```bash
    git add .
    git commit -m "feat: description de la fonctionnalité"
    ```

5. **Push et Pull Request**
    ```bash
    git push origin feat/ma-fonctionnalite
    ```

## Tests

Actuellement, il n'y a pas de tests automatisés. Les tests sont effectués manuellement :

1. Tester sur la plateforme de développement
2. Vérifier les logs pour les erreurs
3. Tester les fonctionnalités principales :
    - Initialisation
    - Changement de langue
    - Persistance des données

## Debugging

### Logs

Les logs sont disponibles dans :

- **Console** : Sortie directe dans le terminal
- **Fichier** : `~/Library/Logs/ecoindex-app/main.log` (macOS)

Le niveau de log est configuré en `debug` pour le développement.

### DevTools

Les DevTools sont automatiquement ouverts en mode développement. Utilisez-les pour :

- Inspecter le DOM
- Voir les erreurs JavaScript
- Déboguer le renderer process

### Debug du Main Process

Pour déboguer le main process, utilisez `console.log` ou `electron-log` :

```typescript
import { getMainLog } from '../main'

const mainLog = getMainLog().scope('mon-module')
mainLog.debug('Message de debug')
mainLog.info("Message d'information")
mainLog.error("Message d'erreur", error)
```

## Points d'attention

### Chemins de fichiers

- **Développement** : Utiliser `process.cwd()` ou `APP_ROOT`
- **Production** : Utiliser `process.resourcesPath` ou `app.getAppPath()`
- Toujours vérifier `app.isPackaged` avant d'utiliser `process.resourcesPath`

### Initialisation i18next

L'initialisation d'i18next est asynchrone. Toujours attendre :

```typescript
await initializeI18n()
// Maintenant on peut utiliser i18n.t()
```

**Important** : La langue doit être chargée depuis le store **avant** l'initialisation pour garantir que tous les messages sont traduits :

```typescript
// Dans main.ts
await initializeI18n()
const savedLanguage = (store.get('language') as string) || 'en'
await i18n.changeLanguage(savedLanguage)
// Maintenant l'initialisation peut commencer avec les bonnes traductions
```

### Popin d'initialisation

Le composant `InformationPopin` affiche les messages d'initialisation dans le renderer. Pour l'utiliser :

1. **Écouter les messages** via `window.initialisationAPI.sendInitializationMessages()`
2. **Gérer les états** : `display`, `title`, `message`, `progress`, `isAlert`, etc.
3. **Afficher le composant** dans le JSX avec les props appropriées

**Exemple d'utilisation** : Voir `src/renderer/main_window/App.tsx` pour une implémentation complète.

### Scripts utilitaires

Les scripts dans `lib/` sont exécutés via `utilityProcess`. Le chemin doit être correct :

- Développement : `process.cwd()/lib/`
- Production : `process.resourcesPath/lib.asar/` (macOS/Linux) ou `process.resourcesPath/../lib/` (Windows)

### Variables d'environnement

Les variables d'environnement sont chargées depuis `.env` via `dotenv`. Voir [BUILD.md](BUILD.md) pour la liste complète.

## Styling avec Tailwind CSS

### Utilisation des classes

L'application utilise Tailwind CSS v3 avec des classes utilitaires. Exemples :

```tsx
// Bouton vert principal
<button className="btn btn-green">Action</button>

// Bouton rouge destructif
<button className="btn btn-red">Supprimer</button>

// Utilisation des couleurs personnalisées
<div className="bg-ecoindex-green-500 text-ecoindex-green-950">
  Contenu
</div>
```

### Classes personnalisées disponibles

#### Boutons

- `btn` : Style de base
- `btn-green` : Bouton vert principal
- `btn-red` : Bouton rouge destructif
- `btn-green-outlined` : Bouton vert avec bordure
- `btn-square` : Bouton carré
- `btn-small` : Bouton de petite taille

#### Utilitaires

- `echo` : Zone de code/console
- `logo-ecoindex` : Logo Ecoindex
- `mandatory` : Indicateur de champ obligatoire
- `tooltip` : Tooltip personnalisé

### Couleurs personnalisées

Les couleurs `ecoindex-green` et `ecoindex-red` sont disponibles avec toutes leurs nuances (50, 100, 200, ..., 950) :

```tsx
// Exemples
<div className="bg-ecoindex-green-500">...</div>
<div className="text-ecoindex-red-600">...</div>
<div className="border-ecoindex-green-800">...</div>
```

### Mode sombre

Le mode sombre est géré via la classe `.dark` sur un élément parent. Les variables CSS s'adaptent automatiquement :

```tsx
<div className="dark">{/* Contenu en mode sombre */}</div>
```

### Ajout de nouveaux styles

Pour ajouter de nouveaux styles personnalisés :

1. **Styles utilitaires** : Ajouter dans `@layer components` dans `src/renderer/main_window/index.css`
2. **Nouvelles couleurs** : Ajouter dans `theme.extend.colors` dans `tailwind.config.js`
3. **Nouvelles animations** : Ajouter dans `theme.extend.animation` dans `tailwind.config.js`

**Exemple** :

```css
@layer components {
    .mon-style-personnalise {
        @apply flex items-center gap-2 rounded-lg px-4 py-2;
    }
}
```

## Dependencies

### Dépendances principales

- `electron` : Framework desktop
- `react`, `react-dom` : Framework UI
- `electron-store` : Persistance
- `electron-log` : Logging
- `i18next` : Internationalisation

### Dépendances de développement

- `@electron-forge/cli` : Build tooling
- `typescript` : Typage
- `eslint` : Linter
- `prettier` : Formateur
- `vite` : Build tool

### Scripts utilitaires (`lib/`)

Les scripts dans `lib/` ont leurs propres dépendances :

- `lighthouse`
- `lighthouse-plugin-ecoindex-core`
- `lighthouse-plugin-ecoindex-courses`

Installées via `npm ci` dans le dossier `lib/`.

## Ressources

- [Documentation Electron](https://www.electronjs.org/docs)
- [Documentation React](https://react.dev/)
- [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- [Documentation i18next](https://www.i18next.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
