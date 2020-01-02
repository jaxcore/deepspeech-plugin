const EventEmitter = require('events');
const AudioRecorder = require(`node-audiorecorder`);
const PorcupineModule = require(`./pv_porcupine`);
global.PorcupineModule = PorcupineModule;
const Porcupine = require(`./porcupine`);
const pcmConvert = require('pcm-convert');

const defaultHotwrds = {
	bumblebee: require('../hotwords/bumblebee'),
	grasshopper: require('../hotwords/grasshopper'),
	hey_edison: require('../hotwords/hey_edison'),
	porcupine: require('../hotwords/porcupine')
	// terminator: require('../hotwords/terminator') // terminator doesnt seem to work, it gets triggered every 3 seconds
};

class BumblebeeNode extends EventEmitter {
	constructor() {
		super();
		this.hotword = null;
		this.hotwords = {};
		this.setSensitivity(0.5);
		this.inputBuffer = [];
	}
	
	addHotword(name, data, sensitivity) {
		if (!data) {
			if (name in defaultHotwrds) {
				data = defaultHotwrds[name];
			}
		}
		if (data) {
			this.hotwords[name] = {
				data,
				sensitivity: sensitivity || this.defaultSensitivity
			};
		}
		else throw new Error('no hotword data');
	}
	
	setSensitivity(s) {
		this.defaultSensitivity = s;
	}
	
	stop() {
		if (this.recorder) this.recorder.stop();
		this.started = false;
	}
	
	start() {
		if (this.started) return;
		if (Porcupine.isLoaded()) {
			this._start();
		}
		else {
			Porcupine.loader.on('ready', () => {
				this._start();
			});
			
		}
	}
	_start() {
		this.started = true;
		
		let keywordIDs = {};
		let sensitivities = [];
		this.keywordIndex = [];
		for (let id in this.hotwords) {
			let h = this.hotwords[id];
			keywordIDs[id] = h.data;
			this.keywordIndex[sensitivities.length] = id;
			sensitivities.push(h.sensitivity);
		}
		
		let keywordIDArray = Object.values(keywordIDs);
		
		this.porcupine = Porcupine.create(keywordIDArray, sensitivities);
		
		this.recorder = new AudioRecorder({
			program: process.platform === 'win32' ? 'sox' : 'rec',
			silence: 0
		});
		
		this.recorder.start();
		
		let stream = this.recorder.stream();
		stream.on(`error`, () => {
			console.log('Recording error.');
		});
		
		stream.on('data', (data) => {
			// records as int16, convert back to float for porcupine
			let float32arr = pcmConvert(data, 'int16 mono le', 'float32');
			this.processAudio(float32arr);
			this.emit('data', data, 16000);
		});
	}
	
	processAudio(inputFrame) {
		let inputSampleRate = 16000;
		
		for (let i = 0; i < inputFrame.length; i++) {
			this.inputBuffer.push((inputFrame[i]) * 32767);
		}
		
		const PV_SAMPLE_RATE = 16000;
		const PV_FRAME_LENGTH = 512;
		
		while ((this.inputBuffer.length * PV_SAMPLE_RATE / inputSampleRate) > PV_FRAME_LENGTH) {
			let outputFrame = new Int16Array(PV_FRAME_LENGTH);
			let sum = 0;
			let num = 0;
			let outputIndex = 0;
			let inputIndex = 0;
			
			while (outputIndex < PV_FRAME_LENGTH) {
				sum = 0;
				num = 0;
				while (inputIndex < Math.min(this.inputBuffer.length, (outputIndex + 1) * inputSampleRate / PV_SAMPLE_RATE)) {
					sum += this.inputBuffer[inputIndex];
					num++;
					inputIndex++;
				}
				outputFrame[outputIndex] = sum / num;
				outputIndex++;
			}
			
			this.processPorcupine(outputFrame);
			this.inputBuffer = this.inputBuffer.slice(inputIndex);
		}
	}
	
	processPorcupine(data) {
		let id = this.porcupine.process(data);
		if (id > -1) {
			this.emit('hotword', this.keywordIndex[id]);
		}
	}
}

module.exports = BumblebeeNode;