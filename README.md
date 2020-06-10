Jaxcore DeepSpeech Plugin
=======

[Jaxcore](https://github.com/jaxcore/jaxcore) is an open source cybernetic control system.
This plugin connects [Mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech)
to [Jaxcore](https://github.com/jaxcore/jaxcore) to enable speech recognition support and voice control of any device or service that is connected.

This DeepSpeech library combined with a set of other speech related tools provides developers with all the key speech technologies necessary to write a voice assistant in JavaScript.

- Speech-to-Text and Voice Activity Detection
    - [Jaxcore DeepSpeech Plugin](https://github.com/jaxcore/deepspeech-plugin) - based on [DeepSpeech](https://github.com/mozilla/DeepSpeech) and [Node VAD](https://github.com/snirpo/node-vad)
- Text-to-Speech
    - [Jaxcore Say](https://github.com/jaxcore/jaxcore-say) - based on [mEspeak.js](https://www.masswerk.at/mespeak/)
- Microphone Recording + hotword detection
    - [BumbleBee Hotword](https://github.com/jaxcore/bumblebee-hotword) - based on [Porcupine](https://github.com/Picovoice/porcupine)

Related projects:

- [Jaxcore](https://github.com/jaxcore/jaxcore) a cybernetic control library that manages services and devices, and connects them together using adapters
- [Jaxcore Desktop Server](https://github.com/jaxcore/jaxcore-desktop-server) - desktop application server for Windows/MacOS/Linux that runs Jaxcore and makes all services and adapters available through a simple UI
- [Jaxcore Browser Extension](https://github.com/jaxcore/jaxcore-browser-extension) a web browser extension that allows the DeepSpeech plugin to connect to and control web pages using client-side JavaScript technologies

Together, these tools provide JavaScript developers an easy way write "Alexa-like" interactive voice assistants, smart-home controls, and create science-fiction like voice-controlled web applications and games.
Run everything privately on your local computer without any 3rd party cloud computing services required.

## Install

```
npm install jaxcore-deepspeech-plugin
```

To install from source and try the examples:

```
git clone https://github.com/jaxcore/deepspeech-plugin
cd deepspeech-plugin
npm install
```

## Download DeepSpeech Pre-Trained english model:

All the examples require the DeepSpeech english model to be at the root of the project.

```
# enter project directory
cd deepspeech-plugin

wget https://github.com/mozilla/DeepSpeech/releases/download/v0.6.0/deepspeech-0.6.0-models.tar.gz
tar xfvz deepspeech-0.6.0-models.tar.gz
rm deepspeech-0.6.0-models.tar.gz
```

If you have previously download the models a softlink can be made:

```
ln -s /path/to/deepspeech/models
```

## Examples

The examples provided will demonstrate the capabilities and limitations of the system, and provide a good place to start when writing your own "voice apps".

#### NodeJS Examples

These examples run directly in NodeJS:

- [Microphone example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/node-microphone) - basic example of recording a microphone and streaming to DeepSpeech
- [Wake Word example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/node-wakeword) - uses hotword detection to activate/deactivate DeepSpeech
- [Knock, Knock Jokes example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/node-knockknock) - an interactive voice chatbot that tells knock, knock jokes

#### Jaxcore Control Examples

These are more advanced NodeJS examples which use [Jaxcore](https://github.com/jaxcore/jaxcore) to control other devices and network services:

- [Voice Assistant Toolbox](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/voice-assistant-toolbox) - a collection of tools needed to create a voice assistant of your own, includes hotword detection, text-to-speech, and speech-to-text all working at the same time
- [Mouse Control example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/mouse-control) - uses voice commands to control the mouse (eg. mouse up 100, left click, scroll down...)
- [Kodi Control example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/kodi-control) - uses voice commands to control [Kodi Media Center](https://kodi.tv/) navigation and playback (eg. play, pause, select, back, up, down, page up, page down...)
- [Number Typer](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/number-typer) - numbers and symbols that you speak will be typed on the keyboard


#### Web Examples

These use a ReactJS client to stream microphone audio from the browser to a NodeJS server running DeepSpeech:

- [Web Basic example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-basic-example) simple example of recording and speech recognition
- [Web Hotword example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-hotword-example) advanced example using hotword detection, audio visualization, and voice activated menus

#### Electron Example

- [Electron example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/electron-example) runs DeepSpeech and BumbleBee inside an ElectronJS desktop application

#### Jaxcore Browser Extension Examples

These require running the [Jaxcore Desktop Server](https://github.com/jaxcore/jaxcore-desktop-server) and [web browser extension](https://github.com/jaxcore/jaxcore-browser-extension).  This method allows developers to write voice-enabled web applications using only client-side JavaScript.  The Jaxcore application provides the speech recognition support from outside the browser.

- coming soon


## API

This DeepSpeech plugin does not provide any audio recording functionality of it's own.  The purpose of this library is to use VAD (voice activity detection) to stream audio data to an instance of DeepSpeech running in a background thread (fork) in the best way possible.

It is recommended to use [BumbleBee Hotword](https://github.com/jaxcore/bumblebee-hotword) or the [NodeJS version of BumbleBee](https://github.com/jaxcore/bumblebee-hotword-node) to record the microphone audio.  These libraries have been tweaked specifically to work with DeepSpeech and has [Porcupine](https://github.com/Picovoice/Porcupine) hotword detection built-in for wake-word support.

The examples above demonstrate different ways to run BumbleBee to record and stream microphone audio into DeepSpeech.

For NodeJS, this is the basic way:

```
const DeepSpeechPlugin = require('jaxcore-deepspeech-plugin');
const BumbleBeeNode = require('bumblebee-hotword-node');

const bumblebee = new BumbleBeeNode();
bumblebee.setHotword('bumblebee');

DeepSpeechPlugin.start({
	modelName: 'english',
	modelPath: process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.7.3-models', // path to deepspeech model,
	silenceThreshold: 200, // delay for this long before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // options are: 'NORMAL', 'LOW_BITRATE', 'AGGRESSIVE', 'VERY_AGGRESSIVE'
	debug: true
})
.then(deepspeech => {
	// receive the speech recognition results
	deepspeech.on('recognize', (text, stats) => {
		console.log('\nrecognize:', text, stats);
	});
	
	// bumblebee emits a "data" event for every 8192 bytes of audio it records from the microphone
	bumblebee.on('data', function(data) {
		// stream the data to the deepspeech plugin
		deepspeech.streamData(data);
	});

	// bumblebee start the microphone
	bumblebee.start();
})
.catch(console.error);
```

The audio data streamed to DeepSpeech using `deepspeech.streamData(data);` does not specifically have to be from a microphone using BumbleBee, the data can be any `PCM integer 16 bit 16khz` stream from any source.

To receive microphone audio from the browser through a websocket server, see the [Web Basic example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-basic-example).

### API Constructor

There are 2 ways to instantiate the deepspeech plugin:

**1) DeepSpeechPlugin.start()**

```
const DeepSpeechPlugin = require('jaxcore-deepspeech-plugin');

DeepSpeechPlugin.start({
	// deepspeech options
})
.then(deepspeech => {
	// deepspeech process instance
})
.catch(e => {
	// catch error
})
```

**2) Jaxcore Service**

[Jaxcore](https://github.com/jaxcore/jaxcore) uses an alternative syntax to define and launch the deepspeech service.

```
const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

jaxcore.startService('deepspeech', {
	// deepspeech options
}, function(err, deepspeech) {
	// deepspeech process
});
```

Jaxcore adapters use a slightly different API to associate adapters ("programs") with a set of services.  When the adapter is connected, the associated services are launched automatically.  See the [deepspeech adapter example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/jaxcore-deepspeech-adapter).

### API Methods

Stream an audio buffer to the deepspeech plugin:

```
deepspeech.streamData(data);
```

End the stream:

```
deepspeech.streamEnd();
```

End the stream, and any audio data that has been streamed but not yet processed will be ignored:

```
deepspeech.streamReset();
```

### Events

**"recognize"**

Receives the speech recognition results from DeepSpeech:

```
deepspeech.on('recognize', (text, stats) => {
    console('recognize', text, stats);
});
```

## License

[MIT License](https://github.com/jaxcore/deepspeech-plugin/blob/master/LICENSE)

## Change Log

0.0.6:

- refactored VAD logic out of the DeepSpeech process, this improves accuracy during short pauses between words
- added the Number Typer keyboard example
- updated the voice assistant and mouse examples to the newest Jaxcore API