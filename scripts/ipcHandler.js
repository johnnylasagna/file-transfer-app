const { ipcMain } = require('electron/main')
const { handleFileOpen, handleFolderOpen, startFolderServer, stopServer } = require('./functions')

function ipcHandlers() {
    ipcMain.handle('dialog:openFile', handleFileOpen)
    ipcMain.handle('dialog:openFolder', handleFolderOpen)
    ipcMain.handle('server:start', async (event, folderPath, broadcastName, username, password) => { return await startFolderServer(folderPath, broadcastName, username, password) })
    ipcMain.handle('server:stop', stopServer)
}

module.exports = ipcHandlers;