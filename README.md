Jaxcore DeepSpeech Plugin
=======


Jaxcore is an open source cybernetic control system with support for  
This plugin connects [Mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech) (a speech recognition engine)
to [Jaxcore](https://jaxcore.com) (a cybernetic control system).

Using Jaxcore with the DeepSpeech plugin it is easy to write "Alexa-like" interactive voice assistants,
smart-home controls, and create science-fiction like voice-controlled web applications and games.  
Run everything privately on your local computer without any 3rd party cloud computing services required.

## Install

```
git clone https://github.com/jaxcore/deepspeech-plugin
cd deepspeech-plugin
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

## Hello World "speech adapter"

See the [hello-world-adapter](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/hello-world-adapter) for a simple voice control script which listens for "hello world" and prints to the console.  On MacOSX it uses the "say" command line to respond with synthesized speech.

Copy and modify this script to use your voice to control ***anything your want***.

```
// import Jaxcore and create an instance
const Jaxcore = require('jaxcore');
const {Adapter} = require('jaxcore');
const jaxcore = new Jaxcore();

// import the Jaxcore Speech plugin
const SpeechPlugin = require('../../index'); // or use require('jaxcore-deepspeech-plugin');
jaxcore.addPlugin(SpeechPlugin);

// import spawn to call "say" command line on MacOSX
const {spawn, spawnSync} = require('child_process');

function say(text, sync) {
	if (process.platform === 'darwin') {
		if (sync) spawnSync('say', [JSON.stringify(text)]);
		else spawn('say', [JSON.stringify(text)]);
	}
}

// create a custom Jaxcore adapter for handling speech
class HelloWorldAdapter extends Adapter {
	constructor(store, config, theme, devices, services) {
		super(store, config, theme, devices, services);
		const {speech} = devices;
		
		this.addEvents(speech, {
			recognize: function (text, stats) {
				console.log('speech recognized:', text);
				
				/* YOUR CODE GOES HERE */
				
				if (text === 'hello world') {
					console.log('YOU SAID HELLO WORLD!!!');
					
					// stop recording before using speech synthesis
					speech.stopContinuous();
					
					// use speech synthesis to respond
					say('hello world');
					
					// wait 2 seconds to let "say" complete before turning on continuous recording
					setTimeout(function() {
						speech.startContinuous();
					},1500);
				}
				
			}
		});
		
		// start recording continuously
		say('recording is now on', true);
		speech.startContinuous();
	}
}

// add the adapter to Jaxcore
jaxcore.addAdapter('helloworld', HelloWorldAdapter);

jaxcore.on('service-connected', function(type, service) {
	if (type === 'speech') {
		// when the speech service is ready, launch the adapter
		const speech = service;
		jaxcore.launchAdapter(speech, 'helloworld');
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


## Mouse Control speech adapter

Using this test script you can control your computer mouse with your voice:

```
node examples/speech-mouse-adapter/start.js
```

Available voice commands are:

- "left click" // clicks left mouse button
- "right click" // clicks right mouse button
- "middle click" // clicks middle mouse button
- "mouse up 100" // moves mouse up 100 pixels
- "mouse down 100" // moves mouse down 100 pixels
- "mouse left 100" // moves mouse left 100 pixels
- "mouse right 100" // moves mouse right 100 pixels
- "page down" // presses page down key
- "page up" // presses page down key
- "up" // presses up arrow key
- "down" // presses down arrow key
- "left" // presses left arrow key
- "right" // presses right arrow key
- "scroll down"
- "scroll down 100" // scrolls down 100 pixels
- "scroll up"
- "scroll up 100" // scrolls up 100 pixels



#### TODO: get web demos working again