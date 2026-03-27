const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')

// To import preload.js correctly
const path = require('node:path')

// Function to create window
const createWindow = () => {
	// Defining how window is created
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		titleBarStyle: 'hidden',
		resizable: true,
		frame: false,
		transparent: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})

	// win.setMenuBarVisibility(null);
	

	// File to load into browser window
	win.loadFile('index.html')

	// Open developer tools
	win.webContents.openDevTools();
}

async function handleFileOpen() {
	const { cancelled, filePaths } = await dialog.showOpenDialog({})
	if (!cancelled) {
		return filePaths[0]
	}
}

async function handleFolderOpen() {
	const { cancelled, filePaths } = await dialog.showOpenDialog({
		properties: ['openDirectory']
	})
	if (!cancelled) {
		return filePaths[0]
	}
}

// To run shell scripts
const { spawn } = require('node:child_process')

let serverProcess = null

function startFolderServer(folderPath) {
	return new Promise((resolve, reject) => {
		serverProcess = spawn('python3', ['-m', 'http.server', '8000'], {
			cwd: folderPath
		})

		serverProcess.stdout.on('data', data => {
			console.log(`stdout: ${data}`)
			resolve(`Server started in ${folderPath}`)
		})

		serverProcess.stderr.on('data', data => {
			reject(data.toString())
		})

		serverProcess.on('error', err => {
			reject(err.message)
		})
	})
}

// Only runs when electron starts
app.whenReady().then(() => {
	ipcMain.handle('dialog:openFile', handleFileOpen)
	ipcMain.handle('dialog:openFolder', handleFolderOpen)
	ipcMain.handle('start-server:folder', async (event, folderPath) => { return await startFolderServer(folderPath) })
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