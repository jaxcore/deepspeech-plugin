const Jaxcore = require('jaxcore');
const {Adapter} = require('jaxcore');
const SpeechPlugin = require('../../index');

const jaxcore = new Jaxcore();
jaxcore.addPlugin(SpeechPlugin);
jaxcore.addPlugin(require('jaxcore/plugins/keyboard'));
jaxcore.addPlugin(require('jaxcore/plugins/mouse'));
jaxcore.addPlugin(require('jaxcore/plugins/scroll'));

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

class SpeechMouseAdapter extends Adapter {
	static getDefaultState() {
		return {
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {speech} = devices;
		const {mouse, keyboard, scroll} = services;
		
		this.addEvents(speech, {
			recognize: function (text, stats) {
				this.log('speech recognize', text, stats);
				
				text = text.replace(/strolled|scrawled|scrawl/,'scroll');
				text = text.replace(/most/,'mouse');
				text = text.replace(/laughed/,'left');
				
				if (text === 'scroll up') {
					console.log('scroll up');
					scroll.scrollVertical(-5, 0);
				}
				if (text === 'scroll down') {
					console.log('scroll down');
					scroll.scrollVertical(5, 0);
				}
				
				if (text === 'mouse up') {
					let pos = mouse.getMousePos();
					let y = pos.y - 100;
					console.log('mouse up', y);
					mouse.moveMouseSmooth(pos.x, y);
				}
				if (text === 'mouse down') {
					let pos = mouse.getMousePos();
					let y = pos.y + 100;
					console.log('mouse down', y);
					mouse.moveMouseSmooth(pos.x, y);
				}
				
				if (text === 'mouse left') {
					console.log('mouse left');
					let pos = mouse.getMousePos();
					let x = pos.x - 100;
					mouse.moveMouseSmooth(x, pos.y);
				}
				if (text === 'mouse right') {
					console.log('mouse right');
					let pos = mouse.getMousePos();
					let x = pos.x + 100;
					mouse.moveMouseSmooth(x, pos.y);
				}
			},
			start: function() {
				this.log('on start');
			},
			stop: function(stats) {
				this.log('on stop', stats);
			}
		});
		
		// console.log('in 7.....');
		// setTimeout(function() {
		// 	speech.startContinuous();
		// }, 2000);
		
		process.stdin.resume();
		
		this.startConsoleLoop();
		
	}
	
	startConsoleLoop() {
		const {speech} = this.devices;
		
		readline.question('\nPress ENTER to start recording.\n', () => {
			
			readline.question('Press ENTER to stop.\n', (name) => {
				speech.stopContinuous();
				console.log('Stopped recording.');
				this.startConsoleLoop();
			});
			
			speech.startContinuous();
		});
	}
	
	static getServicesConfig(adapterConfig) {
		console.log('getServicesConfig', adapterConfig);
		// process.exit();
		return {
			keyboard: true,
			mouse: true,
			scroll: true
		};
	}
}

jaxcore.addAdapter('speech-mouse', SpeechMouseAdapter);

jaxcore.on('service-connected', function(type, service) {
	if (type === 'speech') {
		jaxcore.launchAdapter(service, 'speech-mouse');
	}
});

jaxcore.startService('speech', null, null, {
	modelName: 'english',
	modelPath: __dirname + '/../../deepspeech-0.6.0-models'
}, function(err, speech) {
	console.log('speech service');
	// process.exit();
});