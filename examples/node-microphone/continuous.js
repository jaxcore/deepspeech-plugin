let Listen = require('../../lib/listen');

let listen = new Listen({
	path: __dirname+'/../../models'
});

listen.on('recognize', function(text) {
	console.log('Recognized Text:', text);
});

listen.on('start-continuous', function() {
	console.log('start-continuous');
});

listen.on('stop-continuous', function() {
	console.log('stop-continuous');
});

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

function continuousLoop() {
	console.log('\nPress Ctrl-C to exit at any time.');
	
	readline.question('\nPress ENTER to start continuous recording.\n', (name) => {
		
		readline.question('Press ENTER to stop.\n', (name) => {
			
			console.log('Stopping continuous recording.');
			
			listen.stopContinuous();
			
			setTimeout(continuousLoop, 1000);
			// process.exit();
		});
		
		// todo: fix continuousRecorder already started
		listen.startContinuous();
		
	});
}

process.stdin.resume();

continuousLoop();

// setTimeout(function() {
// 	listen.stopContinuous();
// }, 60000);

// setTimeout(function() {
// // // 	listen.stopContinuous();
// // // 	process.exit();
// // // },20000);