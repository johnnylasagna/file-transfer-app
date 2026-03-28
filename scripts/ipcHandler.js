const { ipcMain } = require('electron/main')
const { handleFileOpen, handleFolderOpen, startFolderServer } = require('./functions')

function ipcHandlers() {
    ipcMain.handle('dialog:openFile', handleFileOpen)
    ipcMain.handle('dialog:openFolder', handleFolderOpen)
    ipcMain.handle('start-server:folder', async (event, folderPath, broadcastName) => { return await startFolderServer(folderPath, broadcastName) })
}

module.exports = ipcHandlers;