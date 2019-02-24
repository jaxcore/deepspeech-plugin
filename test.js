
let Listen = require('./lib/listen');

let listen = new Listen({
	// modelPath: './models/output_graph.pbmm',
	// alphabetPath: './models/alphabet.txt'
});

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

function startConsoleLoop() {
	readline.question('\nPress any key to start recording.\n', (name) => {
		
		const onRecognize = function(text) {
			console.log('Recognized as:', text);
			startConsoleLoop();
		};
		
		listen.start(onRecognize);
		
		readline.question('Press any key to stop.\n', (name) => {
			listen.stop();
			console.log('Stopped recording.');
		});
	});
}

process.stdin.resume();

startConsoleLoop();
