const http = require('http');
const socketIO = require('socket.io');

const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

const SERVER_PORT = 4000; // websocket server port

function startSocketServer(deepspeech) {
	const app = http.createServer(function (req, res) {
		res.writeHead(200);
		res.write('web-basic-example');
		res.end();
	});
	
	const io = socketIO(app, {});
	io.set('origins', '*:*');
	
	io.on('connection', function (socket) {
		console.log('client connected');
		
		socket.once('disconnect', () => {
			console.log('client disconnected');
		});
		
		deepspeech.on('recognize', (text, stats) => {
			socket.emit('recognize', text, stats);
		});
		
		socket.on('stream-data', function (data) {
			deepspeech.streamData(data);
		});
		socket.on('stream-end', function () {
			deepspeech.streamEnd();
		});
		socket.on('stream-reset', function () {
			deepspeech.streamReset();
		});
	});
	
	app.listen(SERVER_PORT, 'localhost', () => {
		console.log('Socket server listening on:', SERVER_PORT);
	});
}

// start the speech adapter (pay attention to the deepspeech modelPath location)
jaxcore.startService('deepspeech', {
	modelName: 'english',
	modelPath: process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.7.3-models', // path to deepspeech model
	silenceThreshold: 200,
	vadMode: 'VERY_AGGRESSIVE',
	debug: true
}, function(err, deepspeech) {
	console.log('deepspeech service ready', typeof deepspeech);
	startSocketServer(deepspeech);
});
