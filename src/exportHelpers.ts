// @electron/remote n'est plus utilisé dans Electron moderne (depuis v14+)
// Ce fichier est conservé pour compatibilité mais peut être supprimé si non utilisé
// import eRemote from '@electron/remote'
import electron from 'electron'

// const fs = eRemote.require('fs')

export const ipcRenderer = electron.ipcRenderer

// export const remote = eRemote
