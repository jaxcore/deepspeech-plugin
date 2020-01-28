Jaxcore DeepSpeech Plugin
=======

[Jaxcore](https://github.com/jaxcore/jaxcore) is an open source cybernetic control system.
This plugin connects [Mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech)
to [Jaxcore](https://github.com/jaxcore/jaxcore) to enable speech recognition support and voice control of any device or service that is connected.

Related projects:

- [BumbleBee-Hotword](https://github.com/jaxcore/bumblebee-hotword) provides hotword detection and microphone stream recording support
- [Jaxcore Say](https://github.com/jaxcore/jaxcore-say) provides text-to-speech (speech synthesis) support
- [Jaxcore](https://github.com/jaxcore/jaxcore) a cybernetic control library that manages services and devices, and connects them together using adapters
- [Jaxcore Desktop Server](https://github.com/jaxcore/jaxcore-desktop-server) - desktop application server for Windows/MacOS/Linux that runs Jaxcore and makes all services and adapters available through a simple UI
- [Jaxcore Browser Extension](https://github.com/jaxcore/jaxcore-browser-extension) a web browser extension that allows Jaxcore devices (and DeepSpeech) to connect to web pages

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

- [Voice Assistant Toolbox](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/jaxcore-voiceassistant-toolbox) - a collection of tools needed to create a voice assistant of your own, includes hotword detection, text-to-speech, and speech-to-text all working at the same time
- [Mouse Control Example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/jaxcore-voicemouse-adapter) - uses voice commands to control the mouse (eg. mouse up 100, left click, scroll down...)
- [Kodi Control Example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/jaxcore-kodi-speech-adapter) - uses voice commands to control [Kodi Media Center](https://kodi.tv/) navigation and playback (eg. play, pause, select, back, up, down, page up, page down...)


#### Web Examples

These use a ReactJS client to stream microphone audio from the browser to a NodeJS server running DeepSpeech:

- [Web Basic example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-basic-example) simple example of recording and speech recognition
- [Web Hotword example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-hotword-example) advanced example using hotword detection, audio visualization, and voice activated menus

#### Electron Example

- [Electron example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/electron-example) runs DeepSpeech and BumbleBee inside an ElectronJS desktop application

#### Jaxcore Browser Extension Examples

These require running the [Jaxcore Desktop Server]() and [web browser extension]().  This method allows developers to write voice-enabled web applications using only client-side JavaScript.  The Jaxcore application provides the speech recognition support from outside the browser.

- coming soon


## API

This DeepSpeech plugin does not provide any audio recording functionality of it's own.  The purpose of this library is to use VAD (voice activity detection) to stream audio data to an instance of DeepSpeech running in a background (forked) process in the most efficient/accurate way possible.

It is recommended to use [BumbleBee Hotword]() or the [NodeJS version of BumbleBee]() to provide record the microphone audio.  These libraries have been tweaked specifically to work with DeepSpeech and has [Porcupine](https://github.com/Picovoice/Porcupine) hotword detection built-in for wake-word support.

The examples above demonstrate different ways to run BumbleBee to record and stream microphone audio into DeepSpeech.

For NodeJS, this is a basic way:

```
const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

const BumbleBee = require('bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');

const MODEL_PATH = process.env.DEEPSPEECH_MODEL || __dirname + '/../../deepspeech-0.6.0-models'; // path to deepspeech model

jaxcore.startService('deepspeech', {
	modelName: 'english',
	modelPath: MODEL_PATH,
	silencThreshold: 200, // delay for this long before processing the audio
	vadMode: 'VERY_AGGRESSIVE', // 'AGGRESSIVE' or 'VERY_AGGRESSIVE' is recommended
}, function(err, deepspeech) {
	
	// receive the speech recognition results
	deepspeech.on('recognize', (text, stats) => {
		console.log('recognize:', text, stats);
	});
	
	// bumblebee emits a "data" event for every 8192 bytes of audio it records from the microphone
	bumblebee.on('data', function(data) {
		// stream the data to the deepspeech plugin
		deepspeech.streamData(data);
	});
	
	// bumblebee start the microphone
	bumblebee.start();
});
```

`deepspeech.streamData(data);` Does not specifically have to be from a microphone, the data can be `PCM integer 16 bit 16khz` from any source.

To receive microphone audio from the browser through a websocket server, see the [Web Basic example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-basic-example).

### API Methods

These methods are used to receive audio data from the browser or from an ElectronJS window:


Stream an audio buffer to the deepspeech plugin:

```
deepspeech.streamData(data);
```

End the stream:

```
deepspeech.streamEnd();
```

End the stream and ignore deepspeech results;

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

The MIT License (MIT)

Copyright (c) 2019 Jaxcore Software Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Change Log

0.0.6:

- refactored VAD logic out of the DeepSpeech process, this improves accuracy during short pauses between words
- add the Number Typer keyboard example
- update the voice assistant and mouse examples to the newest Jaxcore API