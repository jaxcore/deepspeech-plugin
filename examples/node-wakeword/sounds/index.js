var fs = require('fs');
var wav = require('wav');
var Speaker = require('speaker');

function playOn() {
	playSound(__dirname + '/bumblebee-on.wav')
}
function playOff() {
	playSound(__dirname + '/bumblebee-off.wav')
}
function playSound(path) {
	var file = fs.createReadStream(path);
	var reader = new wav.Reader();
	reader.on('format', function (format) {
		// the WAVE header is stripped from the output of the reader
		reader.pipe(new Speaker(format));
	});
	file.pipe(reader);
}

module.exports = {
	playOn,
	playOff,
};