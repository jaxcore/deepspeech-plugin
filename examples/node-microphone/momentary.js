let Listen = require('../../lib/listen');

let listen = new Listen({
	path: __dirname+'/../../models'
});

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

function startConsoleLoop() {
	console.log('\nPress Ctrl-C to exit at any time.');
	
	readline.question('\nPress ENTER to start recording.\n', (name) => {
		
		const onRecognize = function(text) {
			listen.removeListener('recognize', onRecognize);
			console.log('Recognized as:', text);
			startConsoleLoop();
		};
		
		readline.question('Press ENTER to stop.\n', (name) => {
			listen.stop();
			console.log('Stopped recording.');
		});
		
		listen.on('recognize', onRecognize);
		
		listen.start();
	});
}

process.stdin.resume();

startConsoleLoop();
