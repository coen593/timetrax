const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'TimeTrax',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.setMenuBarVisibility(false)

  if (!app.isPackaged) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  const win = createWindow()

  if (app.isPackaged) {
    autoUpdater.checkForUpdates()

    autoUpdater.on('update-downloaded', (info) => {
      dialog
        .showMessageBox(win, {
          type: 'info',
          title: 'Update ready',
          message: `Version ${info.version} has been downloaded. Restart to apply it?`,
          buttons: ['Restart now', 'Later'],
          defaultId: 0,
        })
        .then((result) => {
          if (result.response === 0) {
            autoUpdater.quitAndInstall()
          }
        })
    })
  }
})

app.on('window-all-closed', () => {
  app.quit()
})
