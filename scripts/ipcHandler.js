const { ipcMain } = require('electron/main')
const { shell } = require('electron')
const { handleFileOpen, handleFolderOpen, startFolderServer, stopServer } = require('./server')
const findServers = require('./findServers')

function ipcHandlers() {
    ipcMain.handle('dialog:openFile', handleFileOpen)
    ipcMain.handle('dialog:openFolder', handleFolderOpen)
    ipcMain.handle('server:start', async (event, folderPath, hostname, username, password) => { return await startFolderServer(folderPath, hostname, username, password) })
    ipcMain.handle('server:stop', async (event) => { return await stopServer(); })
    ipcMain.handle('server:find', async (event) => { return await findServers(event); })
    ipcMain.handle('shell:openExternal', async (_event, url) => {
        return shell.openExternal(url)
    })
}

module.exports = ipcHandlers;