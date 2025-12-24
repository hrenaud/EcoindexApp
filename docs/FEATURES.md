# Fonctionnalités

## 1. Processus d'initialisation automatique

L'application effectue une série de vérifications et d'installations au démarrage.

### Étapes d'initialisation

1. **Vérification de Node.js**
    - Détection de la présence de Node.js
    - Vérification de la version (minimum Node.js 20)
    - Affichage d'un lien de téléchargement si Node.js n'est pas installé ou obsolète

2. **Extraction des fichiers (Windows uniquement)**
    - Extraction de `lib.asar` vers le dossier `lib/` si nécessaire
    - Nécessaire pour accéder aux scripts dans l'archive ASAR

3. **Détection des dossiers utilisateur**
    - Récupération du dossier home (`~`)
    - Récupération ou création du dossier de travail (workDir)
    - Persistance du dernier dossier de travail utilisé

4. **Vérification et installation du navigateur Puppeteer**
    - Vérification si le navigateur Chromium de Puppeteer est installé
    - Installation automatique si nécessaire
    - Vérification post-installation

5. **Finalisation**
    - Marquage de l'application comme initialisée
    - Affichage d'un message de succès
    - Fermeture de l'écran de démarrage (splash screen)

### Gestion des erreurs

- **Erreurs fatales** : Arrêt de l'initialisation avec message d'erreur
- **Liens d'aide** : Affichage de liens vers les ressources nécessaires (ex: téléchargement Node.js)
- **Logs détaillés** : Toutes les étapes sont loggées via `electron-log`

## 2. Système d'internationalisation (i18n)

L'application supporte deux langues :

- **Français (fr)**
- **Anglais (en)**

### Configuration i18n

**Main Process** (`src/configs/i18next.config.ts`) :

- Utilise `i18next-fs-backend` pour charger les fichiers JSON
- Chemin des traductions :
    - Développement : `src/locales/{{lng}}/{{ns}}.json`
    - Production : `process.resourcesPath/locales/{{lng}}/{{ns}}.json`
- Initialisation asynchrone avec chargement explicite du namespace `translation`

**Renderer Process** (`src/configs/i18nResources.ts`) :

- Utilise `i18next-resources-to-backend` pour le chargement dynamique
- Chargement de la langue sauvegardée au démarrage
- Écoute des changements de langue depuis le main process

### Changement de langue

- **Menu Electron** : Menu "View > Language" avec sélection radio
- **Composant UI** : `LanguageSwitcher` dans l'interface React
- **Persistance** : Langue sauvegardée dans `electron-store`
- **Synchronisation** : Changements propagés entre main et renderer via IPC

## 3. Système de stockage (electron-store)

L'application utilise `electron-store` pour persister les préférences.

### Données stockées

- `language` : Langue sélectionnée (défaut: 'en')
- `lastWorkDir` : Dernier dossier de travail utilisé
- `app_installed_done_once` : Flag d'initialisation complète
- `npmDir` : Chemin du dossier npm global
- `nodeDir` : Chemin de l'exécutable Node.js
- `nodeVersion` : Version de Node.js détectée

### API exposée au renderer

Via `window.store` :

- `set(key, value)` : Sauvegarder une valeur
- `get(key, defaultValue?)` : Récupérer une valeur
- `delete(key)` : Supprimer une clé

## 4. Communication IPC (Inter-Process Communication)

Voir [API.md](API.md) pour la documentation complète des canaux IPC.

### Canaux IPC principaux

**Initialisation** :

- `initialization-app` : Déclencher l'initialisation
- `initialization-messages` : Messages d'état de l'initialisation
- `host-informations-back` : Retour des données d'initialisation

**Langue** :

- `change-language` : Changer la langue
- `get-language` : Récupérer la langue actuelle
- `language-changed` : Notification de changement de langue

**Store** :

- `store-set` : Sauvegarder une valeur
- `store-get` : Récupérer une valeur
- `store-delete` : Supprimer une clé

## 5. Écran de démarrage (Splash Screen)

L'application affiche un écran de démarrage pendant l'initialisation avec :

- Messages de progression traduits
- Indicateur de progression (étape X/Y)
- Gestion des erreurs avec liens d'aide
- Fermeture automatique à la fin de l'initialisation

## 6. Menu Electron

Le menu de l'application inclut :

- **View > Language** : Sélecteur de langue (FR/EN)
- **View > Reload** : Recharger la fenêtre
- **View > Toggle DevTools** : Ouvrir/fermer les DevTools
- **View > Zoom** : Contrôles de zoom
- **View > Fullscreen** : Mode plein écran

## Limitations actuelles

### Fonctionnalités non implémentées

1. **Mesures Lighthouse/Ecoindex** : Canaux IPC définis mais handlers manquants
2. **Interface de configuration avancée** : Non développée
3. **Gestion des rapports** : Non implémentée
4. **Installation/mise à jour des plugins Lighthouse** : Partiellement implémentée

### Dépendances externes

- Node.js 22+ requis sur le système hôte
- Installation automatique de Puppeteer (téléchargement ~300MB)

### Plateformes

- Testé principalement sur macOS
- Windows : extraction ASAR nécessaire
- Linux : support basique

## Évolutions futures prévues

D'après les canaux IPC et interfaces définis, les fonctionnalités suivantes sont prévues :

1. **Mesures simples** : Analyse d'une URL unique
2. **Mesures depuis JSON** : Analyse de plusieurs URLs depuis un fichier de configuration
3. **Gestion des parcours** : Support des "courses" (parcours d'analyse)
4. **Installation de plugins** : Installation/mise à jour des plugins Lighthouse Ecoindex
5. **Génération de rapports** : Création et affichage de rapports HTML
6. **Configuration avancée** : Interface pour configurer les options Lighthouse
