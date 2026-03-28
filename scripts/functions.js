const { dialog } = require('electron')
const bonjour = require('bonjour')();

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

// To run shell scripts
const { spawn } = require('node:child_process')

let serverProcess = null
let bonjourService = null

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

async function startFolderServer(folderPath, broadcastName) {
	return new Promise(async (resolve, reject) => {
		if (serverProcess) {
			serverProcess.kill();
			serverProcess = null;
		}

		let port;
		try {
			port = await getAvailablePort(8000);
			console.log('Using port:', port);
		} catch (error) {
			console.error('Error getting port:', error);
			return reject(error);
		}

		const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
		serverProcess = spawn(pythonCmd, ['-m', 'http.server', String(port)], {
			cwd: folderPath
		});

		serverProcess.stderr.on('data', (data) => {
			console.error('Server error:', data.toString());
		});

		serverProcess.on('error', (err) => {
			reject(err);
		});

		// Resolve once the server starts
		serverProcess.stdout.on('data', () => resolve(port));
		setTimeout(() => resolve(port), 500); // fallback if no stdout

		if (!bonjourService) {
			bonjourService = bonjour.publish({
				name: broadcastName,
				type: 'http',
				port: port  // ✅ use dynamic port
			});

			if (bonjourService) {
				console.log('Bonjour Service Details:');
				console.log(`Name: ${bonjourService.name}`);
				console.log(`Type: ${bonjourService.type}`);
				console.log(`Port: ${bonjourService.port}`);
				console.log(`Host: ${bonjourService.host}`);
			}
		}
	});
}

function stopServer() {
	if (serverProcess) {
		serverProcess.kill();
	}
	if (bonjourService) {
		bonjourService.stop();
	}
}

module.exports = { handleFileOpen, handleFolderOpen, startFolderServer, stopServer }