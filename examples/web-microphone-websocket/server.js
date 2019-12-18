const http = require('http');
const socketIO = require('socket.io');
const MemoryStream = require('memory-stream');
// const convert = require('pcm-convert');
// const tou8 = require('buffer-to-uint8array');
const sox = require('sox-stream');
const Duplex = require('stream').Duplex;

let Speech = require('../../lib/speech');

let speech = new Speech({
	models: {
		english: {
			path: __dirname + '/../../deepspeech-0.6.0-models'
		}
	}
});

let desiredSampleRate = speech.currentModel.sampleRate();

const app = http.createServer(function (req, res) {
	res.writeHead(200);
	res.write('jaxcore speech');
	res.end();
});

const io = socketIO(app, {});

// function uint8tofloat32(incomingData) { // incoming data is a UInt8Array
// 	var i, l = incomingData.length;
// 	var outputData = new Float32Array(incomingData.length);
// 	for (i = 0; i < l; i++) {
// 		outputData[i] = (incomingData[i] - 128) / 128.0;
// 	}
// 	return outputData;
// }

function bufferToStream(buffer) {
	let stream = new Duplex();
	stream.push(buffer);
	stream.push(null);
	return stream;
}

io.on('connection', function(socket) {
	console.log('client connected');
	
	socket.once('disconnect', () => {
		console.log('socket disconnected');
		// socket.removeListener('', this._onSpinCcommand);
	});
	
	socket.on('client-ready', function(data) {
		console.log('client-ready', data);
	});
	
	let momentaryStream;
	
	socket.on('audio-begin', function(data) {
		console.log('audio-begin', data);
		
		momentaryStream = new MemoryStream();
		momentaryStream.write(data);
		
		// momentaryStream = new Buffer(data.toString());
		// momentaryStream.write(data);
		// momentaryStream.write(uint8tofloat32(data));
	});
	socket.on('audio-data', function(data) {
		console.log('audio-data', data);
		
		if (momentaryStream) momentaryStream.write(data);
	});
	socket.on('audio-end', function() {
		console.log('audio-end', momentaryStream);
		console.log('desiredSampleRate', desiredSampleRate);
		
		/*
			INCOMING DATA FORMAT:
			
			Uint8Array:
				bitDepth: 32
				channels: 1
				float: true
				sampleRate: 44100
				signed: true
		 */
		
		/*
			OUTPUT DATA FORMAT:
			
			Uint8Array:
				bits: 16,
				channels: 1
				float: true
				sampleRate: 16000
				signed: true
		 */
		
		// THIS IS NOT WORKING:
		
		// let outputStream = new MemoryStream();
		// bufferToStream(momentaryStream).pipe(sox({
		// 	global: {
		// 		'no-dither': true,
		// 	},
		// 	output: {
		// 		bits: 16,
		// 		rate: desiredSampleRate,
		// 		channels: 1,
		// 		encoding: 'signed-integer',
		// 		endian: 'little',
		// 		compression: 0.0,
		// 		type: 'raw'
		// 	}
		// })).pipe(outputStream);
		//
		// console.log('outputStream', outputStream);
		
	});
	
	socket.emit('server-ready');
});

app.listen(4000, 'localhost', () => {
	console.log('Socket server listening on : ' + 4000);
});

