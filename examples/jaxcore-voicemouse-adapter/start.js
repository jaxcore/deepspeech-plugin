const {wordsToNumbers} = require('words-to-numbers');
const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

// PLUGINS

jaxcore.addPlugin(require('jaxcore/plugins/keyboard'));
jaxcore.addPlugin(require('jaxcore/plugins/mouse'));
jaxcore.addPlugin(require('jaxcore/plugins/scroll'));
jaxcore.addPlugin(require('bumblebee-hotword-node'));
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

// SERVICES

jaxcore.defineService('Keyboard', 'keyboard', {});
jaxcore.defineService('Mouse', 'mouse', {});
jaxcore.defineService('Scroll', 'scroll', {});
jaxcore.defineService('Bumblebee Node', 'bumblebeeNode', {});
jaxcore.defineService('Deepspeech English', 'deepspeech', {
	modelName: 'english',
	modelPath: process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.6.0-models', // path to deepspeech model
	silenceThreshold: 200,
	vadMode: 'VERY_AGGRESSIVE',
	debug: 'true'
});

// ADAPTER

function numberize(text) {
	text = text.replace(/^to /,'two ').replace(/ to$/,' two').replace(/ to /,' two ');
	let nums = wordsToNumbers(text).toString();
	console.log('nums', nums);
	nums = nums.replace(/ /g,'');
	let num = parseInt(nums);
	if (isNaN(num)) return null;
	return num;
}

class VoiceMouseAdapter extends Jaxcore.Adapter {
	
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {bumblebeeNode, deepspeech, keyboard, mouse, scroll} = services;
		
		bumblebeeNode.setHotword('bumblebee');
		
		this.addEvents(deepspeech, {
			recognize: function (text, stats) {
				this.log('speech recognize', text);
				
				text = text.replace(/rose/,'mouse');
				text = text.replace(/when/,'one');
				text = text.replace(/most of|mouth of/,'mouse up');
				text = text.replace(/most of/,'mouse up');
				text = text.replace(/stroll |strolled |scrawled |scrawl /,'scroll ');
				text = text.replace(/nose |mount |most |mollie |mos |mose |malise |morison|mouth /,'mouse ');
				text = text.replace(/laughed /,'left ');
				text = text.replace(/write |rated |rate |rat /,'right ');
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
		
		this.addEvents(bumblebeeNode, {
			hotword: function(hotword) {
				console.log('\n[hotword detected:', hotword, ']');
			},
			data: function (data) {
				deepspeech.streamData(data);
			}
		});
		
		bumblebeeNode.start();
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
}

jaxcore.addAdapter('voice-mouse', VoiceMouseAdapter);

// CONNECT THE "voice-mouse" ADAPTER TO THE SERVICES

jaxcore.defineAdapter('Voice Mouse', {
	adapterType: 'voice-mouse',
	serviceProfiles: [
		'Bumblebee Node',
		'Deepspeech English',
		'Keyboard',
		'Mouse',
		'Scroll'
	]
});

jaxcore.connectAdapter(null, 'Voice Mouse');
