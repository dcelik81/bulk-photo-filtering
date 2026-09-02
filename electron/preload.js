const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getImages: (dirPath) => ipcRenderer.invoke('get-images', dirPath),
  getRawPreview: (imagePath) => ipcRenderer.invoke('get-raw-preview', imagePath),
  exportAll: (inputDir, outputDir, settings) => ipcRenderer.invoke('export-all', inputDir, outputDir, settings),
  onExportProgress: (callback) => {
    ipcRenderer.on('export-progress', (_event, value) => callback(value))
  },
  removeExportProgress: () => {
    ipcRenderer.removeAllListeners('export-progress')
  }
})
