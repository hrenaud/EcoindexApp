# API et Communication IPC

## APIs exposées au Renderer Process

### window.ipcRenderer

API basique pour la communication IPC (exposée pour compatibilité).

```typescript
window.ipcRenderer.on(channel: string, listener: Function)
window.ipcRenderer.off(channel: string, listener: Function)
window.ipcRenderer.send(channel: string, ...args: any[])
window.ipcRenderer.invoke(channel: string, ...args: any[]): Promise<any>
```

### window.electronAPI

API pour la gestion de la langue.

```typescript
// Changer la langue
window.electronAPI.changeLanguage(lang: string): Promise<void>

// Récupérer la langue actuelle
window.electronAPI.getLanguage(): Promise<string>

// Écouter les changements de langue
window.electronAPI.onLanguageChanged(
    callback: (lang: string) => void
): () => void  // Retourne une fonction pour se désabonner
```

### window.store

API pour le stockage persistant (electron-store).

```typescript
// Sauvegarder une valeur
window.store.set(key: string, value: unknown): Promise<void>

// Récupérer une valeur
window.store.get(key: string, defaultValue?: unknown): Promise<unknown>

// Supprimer une clé
window.store.delete(key: string): Promise<void>
```

### window.initialisationAPI

API pour l'initialisation de l'application.

```typescript
// Lancer l'initialisation (pour compatibilité, mais maintenant lancée automatiquement)
window.initialisationAPI.initializeApplication(
    forceInitialisation: boolean
): Promise<boolean>

// Écouter les messages d'initialisation
window.initialisationAPI.sendInitializationMessages(
    callback: (message: InitalizationMessage) => void
): () => void  // Retourne une fonction pour se désabonner

// Écouter les données de configuration
window.initialisationAPI.sendConfigDatasToFront(
    callback: (data: ConfigData) => void
): () => void  // Retourne une fonction pour se désabonner
```

## Canaux IPC

### Initialisation

#### `initialization-app`

**Direction** : Renderer → Main  
**Type** : `ipcMain.handle`  
**Paramètres** :

- `forceInitialisation: boolean` (optionnel, défaut: `false`)

**Retour** : `Promise<boolean>`

Déclenche le processus d'initialisation. Retourne `true` si l'initialisation réussit, `false` sinon.

#### `initialization-messages`

**Direction** : Main → Renderer  
**Type** : `webContents.send`  
**Message** : `InitalizationMessage`

```typescript
type InitalizationMessage = {
    type: 'message' | 'data'
    modalType: 'started' | 'error' | 'completed'
    title: string
    message: string
    data?: InitalizationData
    step?: number
    steps?: number
    errorLink?: {
        label: string
        url: string
    }
}
```

Messages de progression et d'état de l'initialisation.

#### `host-informations-back`

**Direction** : Main → Renderer  
**Type** : `webContents.send`  
**Message** : `ConfigData`

Retour des données de configuration après chaque étape d'initialisation.

### Langue

#### `change-language`

**Direction** : Renderer → Main  
**Type** : `ipcMain.handle`  
**Paramètres** :

- `lang: string` ('fr' | 'en')

**Retour** : `Promise<void>`

Change la langue de l'application et met à jour le menu Electron.

#### `get-language`

**Direction** : Renderer → Main  
**Type** : `ipcMain.handle`  
**Retour** : `Promise<string>`

Récupère la langue actuellement sauvegardée.

#### `language-changed`

**Direction** : Main → Renderer  
**Type** : `webContents.send`  
**Message** : `string` (langue)

Notification envoyée à toutes les fenêtres lors d'un changement de langue.

### Store

#### `store-set`

**Direction** : Renderer → Main  
**Type** : `ipcMain.handle`  
**Paramètres** :

- `key: string`
- `value: unknown`

**Retour** : `Promise<void>`

Sauvegarde une valeur dans electron-store.

#### `store-get`

**Direction** : Renderer → Main  
**Type** : `ipcMain.handle`  
**Paramètres** :

- `key: string`
- `defaultValue?: unknown`

**Retour** : `Promise<unknown>`

Récupère une valeur depuis electron-store.

#### `store-delete`

**Direction** : Renderer → Main  
**Type** : `ipcMain.handle`  
**Paramètres** :

- `key: string`

**Retour** : `Promise<void>`

Supprime une clé de electron-store.

### Canaux prévus (non implémentés)

Les canaux suivants sont définis dans `src/shared/constants.ts` mais ne sont pas encore implémentés :

- `simple-mesures` : Mesures simples
- `json-mesures` : Mesures depuis fichier JSON
- `save-json-file` : Sauvegarder un fichier JSON
- `read-reload-json-file` : Lire un fichier JSON
- `get-workdir` : Récupérer le dossier de travail
- `get-homedir` : Récupérer le dossier home
- `is-lighthouse-ecoindex-installed` : Vérifier l'installation du plugin
- `install-ecoindex-plugin` : Installer le plugin
- `open-report` : Ouvrir un rapport
- `display-splash-screen` : Afficher l'écran de démarrage

## Types TypeScript

### InitalizationMessage

```typescript
type InitalizationMessage = {
    type: 'message' | 'data'
    modalType: 'started' | 'error' | 'completed'
    title: string
    message: string
    data?: InitalizationData
    step?: number
    steps?: number
    errorLink?: {
        label: string
        url: string
    }
}
```

### ConfigData

```typescript
class ConfigData {
    readonly type: string
    result?: object | string | boolean
    error?: any
    message?: string
    readonly errorType?: string
}
```

### InitalizationData

```typescript
class InitalizationData {
    type: InitalizationDataType
    result: any
}

type InitalizationDataType =
    | 'workDir'
    | 'homeDir'
    | 'appReady'
    | 'puppeteer_browser_installed'
    | 'puppeteer_browser_installation'
    | 'app_can_not_be_launched'
    | 'node_installed'
    | 'node_version_ok'
```

## Exemples d'utilisation

### Écouter les messages d'initialisation

```typescript
useEffect(() => {
    const unsubscribe = window.initialisationAPI.sendInitializationMessages(
        (message) => {
            console.log('Initialization message:', message)
            // Afficher le message dans l'UI
        }
    )

    return () => {
        unsubscribe() // Nettoyer l'écouteur
    }
}, [])
```

### Changer la langue

```typescript
const handleLanguageChange = async (lang: string) => {
    await window.electronAPI.changeLanguage(lang)
    // La langue sera automatiquement mise à jour via onLanguageChanged
}
```

### Utiliser le store

```typescript
// Sauvegarder
await window.store.set('myKey', { data: 'value' })

// Récupérer
const value = await window.store.get('myKey', 'defaultValue')

// Supprimer
await window.store.delete('myKey')
```
