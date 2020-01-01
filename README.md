Jaxcore DeepSpeech Plugin
=======

Jaxcore is an open source cybernetic control system.
This plugin connects [Mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech)
to [Jaxcore](https://github.com/jaxcore/jaxcore) to enable speech recognition support.  A related project, [BumbleBee-Hotword](), provides hotword support.

Together, these tools provide JavaScript developers an easy and straightforward way write "Alexa-like" interactive voice assistants, smart-home controls, and create science-fiction like voice-controlled web applications and games.
Run everything privately on your local computer without any 3rd party cloud computing services required.

## Install

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

## Examples

The examples provided will demonstrate the capabilities and limitations of the system, and provide a good place to start when writing your own "voice apps".  They come in 4 forms:

#### 1) NodeJS Microphone Example (Headless)

These examples run directly in NodeJS and have no user interfaces:

- [node-microphone](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/node-microphone) - basic example of recording a microphone and streaming to DeepSpeech

#### 2) Client-Server Examples

These use a ReactJS client to stream microphone audio from the browser to a NodeJS server running DeepSpeech:

- [web-basic-example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-basic-example) simple example of recording and speech recognition


- [web-hotword-example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-hotword-example) advanced example using [BumbleBee-Hotword]() for hotword activation, audio visualization, and voice activated menus

#### 3) Electron Example

- [electron-example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/electron-example) runs DeepSpeech and BumbleBee inside an ElectronJS desktop application

#### 4) Jaxcore Browser Extension Examples

These require running the [Jaxcore Desktop Server]() and [web browser extension]().  This method allows developers to write voice-enabled web applications using only client-side JavaScript.  The Jaxcore application provides the speech recognition support from outside the browser.

- todo


## API

#### Jaxcore Setup

```
const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();

jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

// specify the DeepSpeech model location
const MODEL_PATH = __dirname + "../../path/to/deepspeech/model";

jaxcore.startService('deepspeech', {
	modelName: 'english',
	modelPath: MODEL_PATH,
}, function(err, deepspeech) {

	/* the "deepspeech" object is a forked NodeJS process that runs DeepSpeech */

	console.log('deepspeech ready', deepspeech);

});
```

#### Microphone Recording Methods

These methods are used to record a stream from the desktop system microphone (requires the `sox` command line tool):

```
deepspeech.startMicrophone();
deepspeech.stopMicrophone();
```

#### Audio Stream Methods

These methods are used to receive audio data from the browser or from an ElectronJS window:

```
deepspeech.streamData(data);  // stream audio buffer to deepspeech
deepspeech.streamEnd();       // end the stream
deepspeech.streamReset();     // end the stream and ignore deepspeech results
```

#### Events

To receive the `speech-to-text` results from DeepSpeech:

```
deepspeech.on('recognize', (text, stats) => {
    console('recognize', text, stats);
});
```
