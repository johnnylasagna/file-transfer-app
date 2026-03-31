const { BrowserWindow } = require('electron')

// To import preload.js correctly
const path = require('node:path')

// Function to create window
const createWindow = () => {
    // Defining how window is created
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        // titleBarStyle: 'hidden',
        resizable: true,
        // frame: false,
        // transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // win.setMenuBarVisibility(null);
    win.removeMenu();

    // File to load into browser window
    win.loadFile(path.join(__dirname, '../renderer/index.html'))

    // Open developer tools
    // win.webContents.openDevTools();
}

module.exports = createWindow