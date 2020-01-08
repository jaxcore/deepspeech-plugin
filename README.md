Jaxcore DeepSpeech Plugin
=======

[Jaxcore](https://github.com/jaxcore/jaxcore) is an open source cybernetic control system.
This plugin connects [Mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech)
to [Jaxcore](https://github.com/jaxcore/jaxcore) to enable speech recognition support.

Related projects:

- [BumbleBee-Hotword](https://github.com/jaxcore/bumblebee-hotword) provides hotword detection and microphone stream recording support
- [Jaxcore Say](https://github.com/jaxcore/jaxcore-say) provides text-to-speech (speech synthesis) support

Together, these tools provide JavaScript developers an easy and straightforward way write "Alexa-like" interactive voice assistants, smart-home controls, and create science-fiction like voice-controlled web applications and games.
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
- [Voice Assistant example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/node-voiceassistant) - a voice assistant example which uses hotword detection, text-to-speech, and speech-to-text all working at the same time
- [Knock, Knock Jokes example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/node-knockknock) - an interactive voice chatbot that tells knock, knock jokes

#### Jaxcore Control Examples

These are more advanced NodeJS examples which use [Jaxcore](https://github.com/jaxcore/jaxcore) to control other devices and network services:

- [Mouse Control Example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/jaxcore-voicemouse-adapter) - uses voice commands to control the mouse (eg. mouse up 100, left click, scroll down...)

#### Web Examples

These use a ReactJS client to stream microphone audio from the browser to a NodeJS server running DeepSpeech:

- [Web Basic example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-basic-example) simple example of recording and speech recognition
- [Web Hotword example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-hotword-example) advanced example using hotword detection, audio visualization, and voice activated menus

#### Electron Example

- [Electron example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/electron-example) runs DeepSpeech and BumbleBee inside an ElectronJS desktop application

#### Jaxcore Browser Extension Examples

These require running the [Jaxcore Desktop Server]() and [web browser extension]().  This method allows developers to write voice-enabled web applications using only client-side JavaScript.  The Jaxcore application provides the speech recognition support from outside the browser.

- todo


## API

#### Quick Start

```
const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

// specify the DeepSpeech model location
const MODEL_PATH = __dirname + "../../path/to/deepspeech/model";

const SERVICE_OPTIONS = {
	modelName: 'english',
	modelPath: MODEL_PATH,
	silencThreshold: 200, // wait for this long before recognizing
	vadMode: 'VERY_AGGRESSIVE', // this is the recommended mode
	debug: 'true' // turn debug logging on
}

jaxcore.startService('deepspeech', SERVICE_OPTIONS, function(err, deepspeech) {

	/* the "deepspeech" object is a forked NodeJS process that runs DeepSpeech */

	console.log('deepspeech ready', deepspeech);

});
```

#### Methods

These methods are used to receive audio data from the browser or from an ElectronJS window:

```
deepspeech.streamData(data);  // stream audio buffer to deepspeech
deepspeech.streamEnd();       // end the stream
deepspeech.streamReset();     // end the stream and ignore deepspeech results
```

#### Events

To receive the speech recognition results from DeepSpeech:

```
deepspeech.on('recognize', (text, stats) => {
    console('recognize', text, stats);
});
```

## API Usage

DeepSpeech plugin does not provid any audio recording functionality of it's own.  The purpose of this library is to run DeepSpeech in a background process inside the Jaxcore control system, leaving the main NodeJS process unblocked.

Microphone data must be streamed through the DeepSpeech service, using the `deepspeech.streamData()` method.

It is recommended to use [BumbleBee Hotword]() in the browser, or [BumbleBee Node]() in Nodejs, to provide record the microphone stream.  The benefits of using these libraries is they include audio recording at the correct bitrate and sample rate for DeepSpeech, and it uses [Porcupine](https://github.com/Picovoice/Porcupine) hotword detection library in the same microphone stream for efficient processing.

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
	modelPath: MODEL_PATH
}, function(err, deepspeech) {
	
	deepspeech.on('recognize', (text, stats) => {
		console.log('recognize:', text, stats);
	});
	
	bumblebee.on('data', function(data) {
		// stream microphone data to deepspeech
		deepspeech.streamData(data);
	});
	
	// bumblebee start the microphone
	bumblebee.start();
});
```

`deepspeech.streamData(data);` Does not specifically have to be from a microphone, the data can be `PCM integer 16 bit 16khz` from any source.

To receive microphone audio from the browser through a websocket server, see the [Web Basic example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-basic-example).


### License

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