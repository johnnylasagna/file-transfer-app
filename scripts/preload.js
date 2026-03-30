const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
	openFile: () => ipcRenderer.invoke('dialog:openFile'),
	openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
	startFolderServer: (path, broadcastName, username, password) => ipcRenderer.invoke('server:start', path, broadcastName, username, password),
	stopFolderServer: () => ipcRenderer.invoke('server:stop')
})