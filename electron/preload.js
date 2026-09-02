const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getImages: (dirPath) => ipcRenderer.invoke('get-images', dirPath),
  getPreview: (imagePath, config) => ipcRenderer.invoke('get-preview', imagePath, config),
  exportAll: (inputDir, outputDir, config) => ipcRenderer.invoke('export-all', inputDir, outputDir, config),
  onExportProgress: (callback) => {
    ipcRenderer.on('export-progress', (_event, value) => callback(value))
  },
  removeExportProgress: () => {
    ipcRenderer.removeAllListeners('export-progress')
  }
})
