const Jaxcore = require('jaxcore');
const {Adapter} = require('jaxcore');
const {wordsToNumbers} = require('words-to-numbers');

const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore/plugins/keyboard'));
jaxcore.addPlugin(require('jaxcore/plugins/mouse'));
jaxcore.addPlugin(require('jaxcore/plugins/scroll'));
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

const BumbleBee = require('bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');

function numberize(text) {
	text = text.replace(/^to /,'two ').replace(/ to$/,' two').replace(/ to /,' two ');
	let nums = wordsToNumbers(text).toString();
	console.log('nums', nums);
	nums = nums.replace(/ /g,'');
	let num = parseInt(nums);
	if (isNaN(num)) return null;
	return num;
}

class VoiceMouseAdapter extends Adapter {
	static getDefaultState() {
		return {
		};
	}
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {speech} = devices;
		const {keyboard, mouse, scroll} = services;
		
		this.addEvents(speech, {
			recognize: function (text, stats) {
				this.log('speech recognize', text);
				
				text = text.replace(/stroll |strolled |scrawled |scrawl /,'scroll ');
				text = text.replace(/most |mollie |mos |malise |morison|mouth /,'mouse ');
				text = text.replace(/laughed/,'left ');
				text = text.trim();
				
				console.log('Speech Recognized:', text);
				
				if (text === 'page up') {
					console.log('page up');
					keyboard.keyPress('pageup');
				}
				if (text === 'page down') {
					console.log('page down');
					keyboard.keyPress('pagedown');
				}
				
				if (text === 'up') {
					console.log('arrow up');
					keyboard.keyPress('up');
				}
				if (text === 'down') {
					console.log('arrow down');
					keyboard.keyPress('down');
				}
				if (text === 'left') {
					console.log('arrow left');
					keyboard.keyPress('left');
				}
				if (text === 'right') {
					console.log('arrow right');
					keyboard.keyPress('right');
				}
				
				if (text === 'scroll up') {
					console.log('scroll up');
					scroll.scrollVertical(-10, 0);
					return;
				}
				
				if (text === 'scroll down') {
					console.log('scroll down');
					scroll.scrollVertical(10, 0);
					return;
				}
				
				if (text === 'right click') {
					console.log('right click');
					mouse.mouseClick('right');
					return;
				}
				
				if (text === 'left click') {
					console.log('left click');
					mouse.mouseClick('left');
					return;
				}
				
				if (text === 'middle click') {
					console.log('middle click');
					mouse.mouseClick('middle');
					return;
				}
				
				let m;
				if (m = text.match(/([a-z]+ )?(up|down|left|right) (.*)/)) {
					this.log('match', m);
					let command = m[1]? m[1].trim() : '';
					let dir = m[2];
					let num = numberize(m[3]);
					if (num !== null) {
						if (command === 'mouse' || !command) {
							this.moveMouse(dir, num);
						}
						else if (command === 'scroll') {
							this.scrollMouse(dir, num);
						}
						
					}
					else {
						console.log('no num', m[1]);
					}
					return;
				}
				else {
					this.log('no match');
				}
			}
		});
		
	}
	
	moveMouse(dir, num) {
		const {mouse} = this.services;
		let pos = mouse.getMousePos();
		let x = pos.x;
		if (dir === 'left') x -= num;
		if (dir === 'right') x += num;
		let y = pos.y;
		if (dir === 'up') y -= num;
		if (dir === 'down') y += num;
		this.log('move mouse '+dir, num);
		mouse.moveMouseSmooth(x, y);
	}
	
	scrollMouse(dir, num) {
		const {mouse} = this.services;
		let x = 0;
		let y = 0;
		if (dir === 'left') x -= num;
		if (dir === 'right') x += num;
		if (dir === 'up') y -= num;
		if (dir === 'down') y += num;
		this.log('scroll mouse '+dir, num);
		mouse.scroll(x, y);
	}
	
	static getServicesConfig(adapterConfig) {
		console.log('getServicesConfig', adapterConfig);
		return {
			keyboard: true,
			mouse: true,
			scroll: true
		};
	}
}

jaxcore.addAdapter('voice-mouse', VoiceMouseAdapter);

const MODEL_PATH = process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.6.0-models'; // path to deepspeech model

jaxcore.startService('deepspeech', {
	modelName: 'english',
	modelPath: MODEL_PATH,
	silenceThreshold: 200, // how many milliseconds of silence before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
	debug: 'true'
}, function(err, deepspeech) {
	
	bumblebee.on('data', function(data) {
		// stream microphone data to deepspeech
		deepspeech.streamData(data);
	});
	
	bumblebee.start();
	
	jaxcore.launchAdapter(deepspeech, 'voice-mouse');
});
