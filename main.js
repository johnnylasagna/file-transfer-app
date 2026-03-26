const { app, browserWindow, BrowserWindow } = require('electron')

// Function to create window
const createWindow = () => {
    // Defining how window is created
    const win = new BrowserWindow({
        width: 800,
        height: 600
    })

    // File to load into browser window
    win.loadFile('index.html')
}

// Only runs when electron starts
app.whenReady().then(()=> {
    createWindow();

    // Only for MacOS
    app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Closing window closes application on windows and linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})