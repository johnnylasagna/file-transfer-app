const { app } = require('electron')
const createWindow = require('./scripts/window');
const { stopServer } = require('./scripts/functions');
const ipcHandlers = require('./scripts/ipcHandler');

// Only runs when electron starts
app.whenReady().then(() => {
	ipcHandlers();
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

// Quit server before closing application
app.on('before-quit', () => {
	stopServer();
});