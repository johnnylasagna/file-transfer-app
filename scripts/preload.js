const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
	openFile: () => ipcRenderer.invoke('dialog:openFile'),
	openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
	startFolderServer: (path, hostname, username, password) => ipcRenderer.invoke('server:start', path, hostname, username, password),
	stopFolderServer: () => ipcRenderer.invoke('server:stop'),
	findServers: (onServerFoundCallback) => {
		ipcRenderer.removeAllListeners('server:discovered');
		ipcRenderer.on('server:discovered', (_event, serverData) => {
			onServerFoundCallback(serverData);
		});

		return ipcRenderer.invoke('server:find');
	}
})