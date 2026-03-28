const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
	openFile: () => ipcRenderer.invoke('dialog:openFile'),
	openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
	startFolderServer: (path, broadcastName) => ipcRenderer.invoke('start-server:folder', path, broadcastName)
})