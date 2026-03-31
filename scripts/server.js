// Import for file/folder choosing dialogue
const { dialog } = require('electron')

// Imports for server
const bonjour = require('bonjour')();
const express = require('express');
const basicAuth = require('express-basic-auth');

// Imports for serving and port finding
const http = require('http');
const net = require('net');
const os = require('os');

// Imports for downloading files
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Setup for server
let expressServer = null;
let bonjourService = null

// Return wifi IP of host
function getWifiIp() {
	const interfaces = os.networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wlan')) {
			for (const net of interfaces[name]) {
				if (net.family === 'IPv4' && !net.internal) {
					return net.address;
				}
			}
		}
	}
	return undefined;
}

// To handle file open dialogue box
async function handleFileOpen() {
	const { cancelled, filePaths } = await dialog.showOpenDialog({
		properties: ['openFile']
	});
	if (!cancelled && filePaths.length > 0) {
		return filePaths[0]
	}
}

// To handle folder open dialogue box
async function handleFolderOpen() {
	const { cancelled, filePaths } = await dialog.showOpenDialog({
		properties: ['openDirectory']
	})
	if (!cancelled && filePaths.length > 0) {
		return filePaths[0]
	}
}

// Find first available port after a certain port
function getAvailablePort(startPort = 8000) {
	return new Promise((resolve, reject) => {
		const server = net.createServer();
		server.listen(startPort, () => {
			const { port } = server.address();
			server.close(() => resolve(port));
		});
		server.on('error', () => resolve(getAvailablePort(startPort + 1)));
	});
}

// Closes express server
function closeExpressServer() {
	return new Promise((resolve) => {
		if (!expressServer) {
			return resolve();
		}

		expressServer.close(() => {
			expressServer = null;
			resolve();
		});
	});
}

// Stops bonjour service
function stopBonjourService() {
	return new Promise((resolve) => {
		if (!bonjourService) {
			return resolve();
		}

		bonjourService.stop(() => {
			bonjourService = null;
			resolve();
		});
	});
}

// Unpublishes bonjour service
function unpublishBonjourServices() {
	return new Promise((resolve) => {
		bonjour.unpublishAll(() => resolve());
	});
}

// Start server in current shared folder
async function startFolderServer(folderPath, hostname, username, password) {
	return new Promise(async (resolve, reject) => {
		await closeExpressServer();
		await stopBonjourService();
		await unpublishBonjourServices();

		let port;
		try {
			port = await getAvailablePort(8000);
		} catch (error) {
			return reject(error);
		}

		const app = express();
		app.use(express.json());

		// Require password for all routes
		app.use(basicAuth({
			users: { [username]: password },
			challenge: true,
			realm: 'FileTransferApp'
		}));

		// Endpoint to download 
		app.get('/api/files', (req, res) => {
			const reqPath = req.query.path || '/'
			const targetPath = path.join(folderPath, reqPath)

			// Prevent access to parent directories
			if (!targetPath.startsWith(folderPath)) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			// Get all files from directory
			fs.readdir(targetPath, { withFileTypes: true }, (err, files) => {
				if (err) return res.status(500).json({ error: err.message });

				const result = files.map(f => ({
					name: f.name,
					isDirectory: f.isDirectory(),
					relativePath: path.join(reqPath, f.name).replace(/\\/g, '/')
				}));
				res.json(result);
			});
		})

		// Endpoint to download multiple files 
		app.post('/api/download-zip', (req, res) => {
			const { files } = req.body;
			if (!files || files.length === 0) {
				return res.status(400).send("No files selected")
			}

			// Allow files to be directly zipped in memory
			res.attachment('download.zip');
			const archive = archiver('zip', { zlib: { level: 9 } });
			archive.pipe(res);

			files.forEach(file => {
				const fullPath = path.join(folderPath, file);

				const stats = fs.statSync(fullPath);

				// Ensure file/folder is within shared directory and exists
				if (fullPath.startsWith(folderPath) && fs.existsSync(fullPath)) {
					if (stats.isFile()) {
						archive.file(fullPath, { name: path.basename(file) });
					} else if (stats.isDirectory()) {
						archive.directory(fullPath, path.basename(file))
					}
				}
			});

			// Download zip
			archive.finalize();
		})

		// Endpoint for previewing individual files
		app.use('/preview', express.static(folderPath));

		// Endpoint for access to website
		app.use('/', express.static(path.join(__dirname, 'public')));

		expressServer = http.createServer(app);

		// Setup bonjour service on server
		expressServer.listen(port, () => {
			const safeName = (hostname && hostname.trim() !== "") ? hostname : "LocalFolderServer";

			const targetIp = getWifiIp();

			if (!bonjourService) {
				bonjourService = bonjour.publish({
					name: safeName,
					type: 'http',
					port: port,
					// host: targetIp,
					probe: false
				});

				bonjourService.on('error', (err) => {
					console.error('Bonjour publish error:', err.message);
				});
			}
			console.log(`Server broadcasting on IP: ${targetIp || 'Default'}`);
			resolve(port);
		});

		expressServer.on('error', (err) => {
			reject(err);
		});

		console.log('Server started')
	});
}

// Stop server
async function stopServer() {
	return new Promise(async (resolve, reject) => {
		await closeExpressServer();
		await stopBonjourService();
		await unpublishBonjourServices();
		console.log('Server stopped')
		resolve();
	});
}

module.exports = { handleFileOpen, handleFolderOpen, startFolderServer, stopServer }