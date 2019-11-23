let Speech = require('../../lib/speech');

let speech = new Speech({
	models: {
		english: {
			path: __dirname + '/../../deepspeech-0.5.1-models'
		}
	}
});

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

function startConsoleLoop() {
	console.log('\nPress Ctrl-C to exit at any time.');
	
	readline.question('\nPress ENTER to start recording.\n', (name) => {
		
		const onRecognize = function (text) {
			speech.removeListener('recognize', onRecognize);
			console.log('Recognized as:', text);
			startConsoleLoop();
		};
		
		readline.question('Press ENTER to stop.\n', (name) => {
			speech.stop();
			console.log('Stopped recording.');
		});
		
		speech.on('recognize', onRecognize);
		
		speech.start();
	});
}

process.stdin.resume();

startConsoleLoop();
