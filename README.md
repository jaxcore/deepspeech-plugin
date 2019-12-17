Jaxcore Speech
=======

Jaxcore Speech is an open source JavaScript voice control system, based on Mozilla
[DeepSpeech](https://github.com/mozilla/DeepSpeech) (speech-to-text), [NodeVAD](https://github.com/snirpo/node-vad) (voice activity detection),
and [RobotJS](https://github.com/octalmage/robotjs).

Jaxcore Speech can run independently, or as a plugin for [Jaxcore](https://jaxcore.com), a cybernetic control system which provides the ability to control computers (mouse, keyboard, volume), media software (Kodi), Chromcast, Sonos and other network devices and applications.

Using Jaxcore and Jaxcore Speech it is easy to write "Alexa-like" interactive voice assistants, smart-home controls, or add science-fiction like voice/motion control to web applications and games.  Run everything privately on your local computer without any 3rd party cloud computing services required.

## Install

```
git clone https://github.com/jaxcore/jaxcore-speech
cd jaxcore-speech
npm install
npm install git+https://github.com/jaxcore/jaxcore#master
```

## Download Pre-Trained DeepSpeech model:

```
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.6.0/deepspeech-0.6.0-models.tar.gz
tar xfvz deepspeech-0.6.0-models.tar.gz
rm deepspeech-0.6.0-models.tar.gz
```

## Run the microphone test examples:

Momentary recording example (press any key to start recording, press any key again to stop)

```
node examples/node-microphone/momentary.js
```

Continuous recording example (press any key to start continuously recording, press any key again to stop)

```
node examples/node-microphone/momentary.js
```

## Try the mouse control adapter

Using this test script you can control your computer mouse with your voice:

```
node examples/speech-mouse-adapter/start.js
```

Mouse adapter voice commands are:

- "scroll down"
- "scroll down 100" // scrolls down 100 pixels
- "scroll up"
- "scroll up 100" // scrolls up 100 pixels
- "page down" // presses page down key
- "page up" // presses page down key
- "up" // presses up arrow key
- "down" // presses down arrow key
- "left" // presses left arrow key
- "right" // presses right arrow key
- "mouse up 100" // moves mouse up 100 pixels
- "mouse down 100" // moves mouse down 100 pixels
- "mouse left 100" // moves mouse left 100 pixels
- "mouse right 100" // moves mouse right 100 pixels
- "left click" // clicks left mouse button
- "right click" // clicks right mouse button
- "middle click" // clicks middle mouse button

## Create your own Jaxcore "voice adapter"

See the [speech-adapter](https://github.com/jaxcore/jaxcore-speech/tree/master/examples/speech-adapter) for a simple voice control script which listens for "hello world" and prints to the console.  Copy and modify this script to use your voice to control ***anything your want***.

```
// import Jaxcore and create an instance
const Jaxcore = require('jaxcore');
const {Adapter} = require('jaxcore');
const jaxcore = new Jaxcore();

// import the Jaxcore Speech plugin
const SpeechPlugin = require('../../index'); // or use require('jaxcore-speech');
jaxcore.addPlugin(SpeechPlugin);

// create a custom Jaxcore adapter for handling speech
class ConsoleAdapter extends Adapter {
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {speech} = devices;
		
		this.addEvents(speech, {
			recognize: function (text, stats) {
				console.log('speech recognized:', text);
				
				/* YOUR CODE GOES HERE */
				
				if (text === 'hello world') {
					console.log('hello world');
				}
				
			}
		});
		
		// start recording continuously
		speech.startContinuous();
	}
}

// add the adapter to Jaxcore
jaxcore.addAdapter('speechconsole', ConsoleAdapter);

jaxcore.on('service-connected', function(type, service) {
	if (type === 'speech') {
		// when the speech service is ready, launch the adapter
		const speech = service;
		jaxcore.launchAdapter(speech, 'speechconsole');
	}
});

// start the speech adapter (pay attention to the deepspeech modelPath location)
jaxcore.startService('speech', null, null, {
	modelName: 'english',
	modelPath: __dirname + '/../../deepspeech-0.6.0-models'
}, function(err, speech) {
	console.log('speech service ready', typeof speech);
});
```

To run the sample adapter:

```
node examples/speech-adapter/start.js 
```

Sample output:

````
TensorFlow: v1.14.0-21-ge77504ac6b
DeepSpeech: v0.6.0-0-g6d43e21
2019-12-16 18:54:37.656109: I tensorflow/core/platform/cpu_feature_guard.cc:142] Your CPU supports instructions that this TensorFlow binary was not compiled to use: AVX2 FMA
speech process connected
speech service ready object
message from main: start-continuous
start-continuous
on start { continuousStart: { stats: 'english' } }
.      // waiting for voice detection...
.
.
.
.
.      // still waiting...
.
.c
.on    // voice activity detected, microphone recording is on
.
.
.r
.x     // silence detected
.r
.r
.r
.X     // silence threshold exceeded
.off   // microphone recording is off
Recognizing ...
Stats: length: 2.3040000000000003s recog time: 1.21 s
speech recognized: hello world
YOU SAID HELLO WORLD!!!
````

#### TODO: get web demos working again