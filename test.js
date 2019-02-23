
let Listen = require('./lib/listen');


// setTimeout(function() {
// 	stopSecording();
// },5000);

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

// function startRecognition() {
// 	console.log('Starting recognition...');
//
// 	setTimeout(function() {
// 		let result = 'blah blah';
// 		console.log('Recognized as:', result);
// 		startConsoleLoop();
// 	}, 2000);
// }

function startConsoleLoop() {
	readline.question('Press any key to start recording.', (name) => {
		
		const onRecognize = function(text) {
			console.log('Recognized as:', text);
			// process.exit();
			console.log('\n\n');
			startConsoleLoop();
		};
		
		const stopRecording = Listen.start(onRecognize);
		
		// console.log(`Hi ${name}!`);
		//console.log('Press any key to stop recording and begin recognition.');
		
		readline.question('Press any key to stop.', (name) => {
			stopRecording();
			
			console.log('Stopped recording.');
			
			// startRecognition();
		});
		//readline.close();
	});
}


process.stdin.resume();

startConsoleLoop();

//console.warn(`Press ctrl+c to exit.`);

// Write incoming data out the console.
/*audioRecorder.stream().on('data', function(chunk) {
	console.log(chunk);
});*/

// Keep process alive.
// process.stdin.resume();
// console.warn(`Press ctrl+c to exit.`);

// Pawn = poned pan pon paw porn pin pa
// Knight = night net neat night knight might night meet not neat knit night not
// King = king king con can kind hun ganggon com
// Queen = queen quan quine quirn
// Rook = rook ruck rock reck recar wreck
// Bishop = bishop ship bishhop ishhip isship beshop misship mishap

// A = a ah aye
// B =