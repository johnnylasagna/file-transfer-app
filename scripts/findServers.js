const bonjour = require('bonjour')();

bonjour.find({ type: 'http' }, (service) => {
  console.log('Found:', service.name);       // "My-Laptop"
  console.log('Host:', service.host);        // "Nishchay.local"
  console.log('Port:', service.port);        // 8000
  console.log('Address:', service.addresses); // ["192.168.1.42"]
  
  // Then connect to it:
  // http://service.addresses[0]:service.port
});