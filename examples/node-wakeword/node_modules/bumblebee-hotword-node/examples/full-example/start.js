var fs = require('fs');
var wav = require('wav');
var Speaker = require('speaker');

const BumbleBee = require('bumblebee-hotword-node');

const bumblebee = new BumbleBee();
bumblebee.setSensitivity(0.5);

bumblebee.addHotword('bumblebee');
bumblebee.addHotword('grasshopper');
bumblebee.addHotword('hey_edison');
bumblebee.addHotword('porcupine');

bumblebee.on('hotword', function (hotword) {
	console.log('');
	console.log('Hotword Detected:', hotword);
	playSound();
});

bumblebee.on('data', function (data) {
	process.stdout.write('.');
});

bumblebee.on('end', function () {
	console.log('end');
});

bumblebee.start(); // start the microphone

// setTimeout(function() { // stop after 10 secconds:
// 	bumblebee.stop();
// },10000);

console.log('Active Hotwords:', Object.keys(bumblebee.hotwords));

function playSound() {
	var file = fs.createReadStream(__dirname + '/bumblebee.wav');
	var reader = new wav.Reader();
	reader.on('format', function (format) {
		// the WAVE header is stripped from the output of the reader
		reader.pipe(new Speaker(format));
	});
	file.pipe(reader);
}