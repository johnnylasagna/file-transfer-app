const { BrowserWindow } = require('electron')

// To import preload.js correctly
const path = require('node:path')

// Function to create window
const createWindow = () => {
    // Defining how window is created
    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        // titleBarStyle: 'hidden',
        resizable: true,
        // frame: false,
        // transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true
        }
    })

    // win.setMenuBarVisibility(null);
    win.removeMenu();

    // File to load into browser window
    win.loadFile(path.join(__dirname, '../renderer/index.html'))

    // Open developer tools
    // win.webContents.openDevTools();
    // Allow downloads by properly handling the download item event
    win.webContents.session.on('will-download', (event, item, webContents) => {
        item.on('updated', (event, state) => {
            if (state === 'interrupted') {
                console.log('Download is interrupted but can be resumed')
            } else if (state === 'progressing') {
                if (item.isPaused()) {
                    console.log('Download is paused')
                } else {
                    console.log(`Received bytes: ${item.getReceivedBytes()}`)
                }
            }
        })
        item.once('done', (event, state) => {
            if (state === 'completed') {
                console.log('Download successfully')
            } else {
                console.log(`Download failed: ${state}`)
            }
        })
    });
    
    // Explicitly allow all permissions for the <webview> environment (like downloading)
    win.webContents.session.setPermissionCheckHandler((webContents, permission) => {
        return true;
    });
    
    win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        callback(true);
    });
}

module.exports = createWindow