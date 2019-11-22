Jaxcore Listen
=======

![screenshot](https://raw.githubusercontent.com/jaxcore/jaxcore-listen/master/screenshot.png)

A client-side JavaScript speech recognition and voice command system for the home and for the Web, based upon [DeepSpeech](https://github.com/mozilla/DeepSpeech).

Jaxcore Listen connects the DeepSpeech speech-to-text engine to Jaxcore (an open source JavaScript remote control system) which makes it easy for web developers to add voice and motion controls to web pages (like Star Trek or Jarvis)  using a simple JavaScript API that can be embedded in web pages using 100% client-side web technologies with no third-party cloud services required.

Although the examples provided are written with ReactJS, both Jaxcore and the Jaxcore Listen web client are framework agnostic, written in pure JavaScript, but must packaged using NPM/CommonJS.  Static builds may be provided at a later date.

The web connectivity in Jaxcore Listen requires that [jaxcore-client](https://github.com/jaxcore/jaxcore-client) be embedded in a web page, a browser extension and desktop app/service must also be installed to provide the speech and motion support.  Jaxcore includes other capabilities you might also be interested in, such as [Jaxcore Spin](https://github.com/jaxcore/jaxcore-spin) motion control support, a [Text-to-Speech](https://github.com/jaxcore/jaxcore-speak) system, [BumbleBee](https://github.com/jaxcore/bumblebee-hotword) a wake-word (like Alexa), and Sound/Microphone visualizations.  Jaxcore plugins are being written to control many types of devices (wireless speakers, home theater stereos, and media players like Plex/Kodi.

See [https://jaxcore.com](https://jaxcore.com) for more details.


## How It Works

![diagram](https://raw.githubusercontent.com/jaxcore/jaxcore-listen/master/diagram.png)

This diagram shows how the Jaxcore desktop app and browser extension are used to connect DeepSpeech and Spin controllers to the web.  Jaxcore establishes a multi-node birectional communication channel from a web page to DeepSpeech and/or one or more Spin devices.  The browser extension will automatically switch to the active browser tab so only one tab can be controlled at a time.


### Prerequisites

In order to run the web demos with full microphone and speech recognition enabled, you must first install both the desktop app and browser extension:

- [Jaxcore Web Browser extension](https://github.com/jaxcore/jaxcore-browser-extension)

The browser extension establishes a communication channel between web pages and the Jaxcore Desktop app which runs DeepSpeech and the Jaxcore Spin bluetooth library, and Simulator.

- [Jaxcore Desktop application](https://github.com/jaxcore/jaxcore-desktop-app) (not yet published)

The DeepSpeech English language model in the desktop app is a very large download (1.8GB), but only needs to be installed once for use across all websites with Jaxcore support.  This all runs locally on a computer, no cloud services required, no signups, no API keys, and most importantly no eavesdropping.

**April-11-2019:** The desktop app is not yet published because it depends on an upcoming version of DeepSpeech (v0.5).  In the meantime, the browser service can be run headless, by following the instructions at:

- [Jaxcore Browser Plugin](https://github.com/jaxcore/browser-plugin)

Windows/Linux:

- [sox](http://sox.sourceforge.net/) (microphone recording)

On computers with Windows and Linux, the `sox` command line audio program may have to be installed on the computer to provide microphone recording.  Make sure it is globally available from the command line.

## Live Demos

- [Basic Functionality Demo](https://jaxcore.github.io/jaxcore-listen/examples/web-demo/) - simple example of microphone speech being interpreted as words, letters, numbers, and dates

- [Vocabulary/Substitution Testing Tool](https://jaxcore.github.io/jaxcore-listen/examples/web-vocab-tester/) - a testing tool used to build a vocabulary list with word substitutions (simple natural language processing)

- [Voice Chess game](https://chess.jaxcore.com) - a full blown Jaxcore game with speech and spin support, designed as a replica of the HAL 9000 chess game in 2001 A Space Odyssey

### Video Demos

- Voice Chess gameplay: [https://www.youtube.com/watch?v=faOfKd1eAQA](https://www.youtube.com/watch?v=faOfKd1eAQA)



## Web Client Usage

#### Web Client Installation

```
npm install jaxcore-client
```

#### Web Client Usage


```
import Jaxcore, {Listen} from "jaxcore-client";

// establish connection to Jaxcore
Jaxcore.connect(function() {

	Listen.on('recognize', function(text) {
		console.log('you said:', text);
	});
	
	// For momentary recognition use:
	
	Listen.start();
	
	setTimeout(function() {
		Listen.stop();
	}, 2000); // stop recording after 2 seconds
		
	// For continuous recognition use:
	/*
	Listen.startContinuous();
	Listen.stopContinuous();
	*/
	
});
```


For further reading, clone this repo and try the basic [web demo](https://jaxcore.github.io/jaxcore-listen/examples/web-demo/) locally:

```
git clone https://github.com/jaxcore/jaxcore-listen.git
cd jaxcore-listen/
npm install
cd examples/web-demo
npm install
npm start
```


## Listen Web API 

**Momentary Recognition**

Momentary recognition is useful to implement short and quick voice commands with no need for voice activity detection.  Start() will begin streaming microphone audio data into a buffer.  Stop() will stop the buffer and begin recognition processing of the audio stream.  For short phrases and commands this can be quite fast depending on the speed of the computer.

- `Listen.start()`

- `Listen.stop()`

- `Listen.on("recognize", callback)`

A potential use case is to map the Spacebar key to start/stop recognition:

```
Listen.on("recognize", function(text) {
	console.log("you said:", text):
})

document.addEventListener('keydown', function(e) {
	if (e.keyCode === 32) {
		Listen.start();
	}
});

document.addEventListener('keyup', function(e) {
	if (e.keyCode === 32) {
		Listen.stop();
	}
});
```

**Continuous Recognition**

Continuous recognition will detect voice activity on the microphone and automatically start/stop the mircophone stream and continuously stream segments of the audio into DeepSpeech.  This would be analagous to how Alexa always listens and processes words that are spoken.  The drawback compared to momentary recognition is the audio clips are longer (and therefore more data must be processed) and delay is required to detect silence before processing can begin.

- `Listen.startContinuous()`

- `Listen.stopContinuous()`

- `Listen.on("recognize", callback)`


**TODO: Utterance Recognition**

A third mode is planned to enable manual start and automatic stop based on the voice activity level.

### Vocabulary Tester
The vocabulary tester can be used as a primitive Natural Language Processor to create your own list of word substitutions.  This is often necessary to catch situations where DeepSpeech recognizes similar sounding words (eg. "tree" instead of "three").  It may require a fair number of substitutions to achieve an acceptable level of accuracy, but this is still substantially easier than creating a new custom DeepSpeech language model.

```
git clone https://github.com/jaxcore/jaxcore-listen.git
cd jaxcore-listen/
npm install
cd examples/web-vocab-tester
npm install
npm start
```

The [tools](https://github.com/jaxcore/jaxcore-listen/tree/master/tools) directory contains scripts to convert a CSV file of words into a JSON key/value list.  The `datetime.csv` would be a good one to copy as it is the most simple.

```
cd tools
cp datetime.csv mycustomlist.csv
node generate-substitutions.js mycustomlist.csv
```

That generates a new file `mycustomlist.json` with the first column as the key, and an array of the words.

See the [interpreters](https://github.com/jaxcore/jaxcore-listen/tree/master/examples/web-vocab-tester/src/interpreters) directory for examples of how to create a function which performs a search and replace using the json interpreter data.  It may also be helpful to view the source code of the [VocabApp](https://github.com/jaxcore/jaxcore-listen/blob/master/examples/web-vocab-tester/src/VocabApp.js)

## NodeJS Module Usage

Jaxcore Listen and DeepSpeech can be use headless, without the need for installing the Jaxcore desktop application, to build local server apps using these technologies.

#### Download DeepSpeech Model

This requires the manual download of the DeepSpeech [English language model data](https://github.com/mozilla/DeepSpeech/releases/download/v0.4.1/deepspeech-0.4.1-models.tar.gz).  To download and extract use:

```
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.4.1/deepspeech-0.4.1-models.tar.gz
tar xvfz deepspeech-0.4.1-models.tar.gz
```


#### NodeJS Module Installation

```
npm install jaxcore-listen --save
```

#### NodeJS Module Usage


```
import Listen from "jaxcore-listen";

const listen = new Listen({
	path: __dirname + '/models'
});

listen.on('recognize', function(text) {
	console.log('you said:', text);
});
	
listen.start();

setTimeout(function() {
	Listen.stop();
}, 2000); // stop recording after 2 seconds
```


#### Run Node Microphone Demos Locally

To try the NodeJS microphone examples locally you can use:

```
git clone https://github.com/jaxcore/jaxcore-listen.git
cd jaxcore-listen/
npm install
cd examples/node-microphone
npm install
```

Make sure to turn your system microphone on and try the different recogntion modes:

```
node momentary.js
```

```
node continuous.js
```