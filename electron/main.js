const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs/promises')
const sharp = require('sharp')

const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.avif'])

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })
  if (result.canceled) return null
  return result.filePaths[0]
})

ipcMain.handle('get-images', async (event, dirPath) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    return entries
      .filter(e => e.isFile() && SUPPORTED_EXT.has(path.extname(e.name).toLowerCase()))
      .map(e => ({ name: e.name, path: path.join(dirPath, e.name) }))
  } catch (err) {
    console.error('get-images error:', err)
    return []
  }
})

ipcMain.handle('get-preview', async (event, imagePath, config) => {
  try {
    // Sıkıştırılmış önizleme (max 1080px)
    let pipeline = sharp(imagePath).resize({
      width: 1080,
      height: 1080,
      fit: 'inside',
      withoutEnlargement: true
    })

    for (const [key, value] of Object.entries(config)) {
      if (typeof pipeline[key] === 'function') {
        if (value === false || value === 0) continue
        
        if (value === true) {
          pipeline = pipeline[key]()
        } else if (Array.isArray(value)) {
          pipeline = pipeline[key](...value)
        } else {
          pipeline = pipeline[key](value)
        }
      }
    }

    const buffer = await pipeline.webp({ quality: 80 }).toBuffer()
    return `data:image/webp;base64,${buffer.toString('base64')}`
  } catch (err) {
    console.error('get-preview error:', err)
    throw err
  }
})

ipcMain.handle('export-all', async (event, inputDir, outputDir, config) => {
  try {
    await fs.mkdir(outputDir, { recursive: true })
    const entries = await fs.readdir(inputDir, { withFileTypes: true })
    const files = entries.filter(e => e.isFile() && SUPPORTED_EXT.has(path.extname(e.name).toLowerCase()))
    
    let processed = 0;
    
    for (const file of files) {
      const inputPath = path.join(inputDir, file.name)
      const outputPath = path.join(outputDir, file.name)
      
      let pipeline = sharp(inputPath)
      for (const [key, value] of Object.entries(config)) {
        if (typeof pipeline[key] === 'function') {
          if (value === false || value === 0) continue
          
          if (value === true) {
            pipeline = pipeline[key]()
          } else if (Array.isArray(value)) {
            pipeline = pipeline[key](...value)
          } else {
            pipeline = pipeline[key](value)
          }
        }
      }
      
      await pipeline.toFile(outputPath)
      processed++;
      mainWindow.webContents.send('export-progress', { total: files.length, current: processed, currentFile: file.name })
    }
    
    return { success: true, count: processed }
  } catch (err) {
    console.error('export-all error:', err)
    return { success: false, error: err.message }
  }
})
