const { dialog } = require('electron')
const bonjour = require('bonjour')();
const express = require('express');
const basicAuth = require('express-basic-auth');
const serveIndex = require('serve-index');
const http = require('http');

// To handle file/folder open dialogues
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

const net = require('net');

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

let expressServer = null;
let bonjourService = null

async function startFolderServer(folderPath, broadcastName, username = "admin", password = "password123") {
	return new Promise(async (resolve, reject) => {
		if (expressServer) {
			expressServer.close();
		}

		let port;
		try {
			port = await getAvailablePort(8000);
		} catch (error) {
			return reject(error);
		}

		const app = express();

		// Require password for all routes
		app.use(basicAuth({
			users: { [username]: password },
			challenge: true,
			realm: 'FileTransferApp'
		}));

		// Serve static files and directory listing
		app.use('/', express.static(folderPath));
		app.use('/', serveIndex(folderPath, { 'icons': true }));

		expressServer = http.createServer(app);

		expressServer.listen(port, () => {
			const safeName = (broadcastName && broadcastName.trim() !== "") ? broadcastName : "LocalFolderServer";

			if (!bonjourService) {
				bonjourService = bonjour.publish({
					name: safeName,
					type: 'http',
					port: port
				});
			}
			resolve(port);
		});

		expressServer.on('error', (err) => {
			reject(err);
		});
	});
}

function stopServer() {
	if (expressServer) {
		expressServer.close();
		expressServer = null;
	}
	if (bonjourService) {
		bonjourService.stop();
		bonjourService = null;
	}
}

module.exports = { handleFileOpen, handleFolderOpen, startFolderServer, stopServer }