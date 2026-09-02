const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs/promises')
const sharp = require('sharp')
const { processPixelBuffer } = require('./pixelProcessor')

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

// ─── IPC Handlers ──────────────────────────────

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

/**
 * Ham önizleme — sadece resize, renk işleme yok.
 * Tüm renk düzenlemeleri frontend'de WebGL ile yapılacak.
 */
ipcMain.handle('get-raw-preview', async (event, imagePath) => {
  try {
    const buffer = await sharp(imagePath)
      .resize({
        width: 1080,
        height: 1080,
        fit: 'inside',
        withoutEnlargement: true
      })
      .png()  // PNG — kayıpsız, WebGL texture yükleme için ideal
      .toBuffer()

    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch (err) {
    console.error('get-raw-preview error:', err)
    throw err
  }
})

/**
 * Tüm görüntüleri export et.
 * Pipeline: Sharp (okuma) → CPU piksel işleme (renk) → Sharp (sharpen + kaydetme)
 */
ipcMain.handle('export-all', async (event, inputDir, outputDir, settings) => {
  try {
    await fs.mkdir(outputDir, { recursive: true })
    const entries = await fs.readdir(inputDir, { withFileTypes: true })
    const files = entries.filter(e => e.isFile() && SUPPORTED_EXT.has(path.extname(e.name).toLowerCase()))

    let processed = 0
    const sharpenSigma = parseFloat(settings.sharpenSigma) || 0

    for (const file of files) {
      const inputPath = path.join(inputDir, file.name)
      const outputPath = path.join(outputDir, file.name)

      try {
        // 1. Görüntüyü raw piksel olarak oku
        const image = sharp(inputPath)
        const metadata = await image.metadata()
        const { data, info } = await image
          .removeAlpha()  // RGB'ye dönüştür (3 kanal)
          .raw()
          .toBuffer({ resolveWithObject: true })

        // 2. CPU piksel işleme (tüm renk ayarları)
        const processedBuffer = processPixelBuffer(
          data,
          info.width,
          info.height,
          info.channels,
          settings
        )

        // 3. İşlenmiş pikselleri Sharp'a geri yükle
        let pipeline = sharp(processedBuffer, {
          raw: {
            width: info.width,
            height: info.height,
            channels: info.channels,
          }
        })

        // 4. Sharpen uygula (WebGL'deki ile aynı amaç)
        if (sharpenSigma > 0) {
          pipeline = pipeline.sharpen({
            sigma: sharpenSigma,
            m1: 1.0,
            m2: 2.0,
          })
        }

        // 5. Orijinal formatta kaydet
        const ext = path.extname(file.name).toLowerCase()
        if (ext === '.png') {
          pipeline = pipeline.png()
        } else if (ext === '.webp') {
          pipeline = pipeline.webp({ quality: 90 })
        } else if (ext === '.tiff') {
          pipeline = pipeline.tiff()
        } else if (ext === '.avif') {
          pipeline = pipeline.avif({ quality: 80 })
        } else {
          pipeline = pipeline.jpeg({ quality: 90 })
        }

        await pipeline.toFile(outputPath)
      } catch (fileErr) {
        console.error(`Export error for ${file.name}:`, fileErr)
      }

      processed++
      mainWindow.webContents.send('export-progress', {
        total: files.length,
        current: processed,
        currentFile: file.name,
      })
    }

    return { success: true, count: processed }
  } catch (err) {
    console.error('export-all error:', err)
    return { success: false, error: err.message }
  }
})
