import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getNode: () => ipcRenderer.invoke('get_node'),

  openFile: (fileType, defaultPath) => ipcRenderer.invoke('open_file', fileType, defaultPath),
  getDefaultOutputPath: () => ipcRenderer.invoke('get_default_output_path'),
  chooseSaveFile: () => ipcRenderer.invoke('choose_save_file'),

  previewFile: (filePath, isDefault) => {
    ipcRenderer.send('preview_file', filePath, isDefault)
  },

  generate: (data) => ipcRenderer.invoke('generate', data),
  onOpenAboutPage: (callback) => ipcRenderer.on('about_page', callback),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
