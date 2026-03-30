const bonjour = require('bonjour')();

let bonjourBrowser = null;

function findServers(event) {
	if (bonjourBrowser) {
		bonjourBrowser.stop();
	}

	bonjourBrowser = bonjour.find({ type: 'http' });

	bonjourBrowser.on('up', (service) => {
		const serverData = {
			name: service.name,
			host: service.host,
			port: service.port,
			addresses: service.addresses
		};
		
		event.sender.send('server:discovered', serverData);
	});

	return true;
}

module.exports = findServers