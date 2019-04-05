let Listen = require('../../lib/listen');

let listen = new Listen();

listen.on('recognize', function(text) {
	console.log('Recognized Text:', text);
});

listen.startContinuous();

// setTimeout(function() {
// // // 	listen.stopContinuous();
// // // 	process.exit();
// // // },20000);