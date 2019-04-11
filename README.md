Jaxcore Listen
=======

![screenshot](https://raw.githubusercontent.com/jaxcore/jaxcore-listen/master/screenshot.png)

A client-side JavaScript speech recognition and voice command system for the home and for the Web, based upon [DeepSpeech](https://github.com/mozilla/DeepSpeech).

Jaxcore Listen conntects the DeepSpeech speech-to-text engine to Jaxcore, an open source JavaScript remote control system, which makes it easy for web developers to add voice and motion controls to web pages (like Star Trek or Jarvis)  using a simple JavaScript API that can be embedded in web pages (100% client-side) or run headless in NodeJS.

This Git repository contains the [client-side web examples](https://github.com/jaxcore/jaxcore-listen/examples) and the NodeJS [library](https://github.com/jaxcore/jaxcore-listen/lib).  The web client connector library (what you add to web pages) is included in [jaxcore-client](https://github.com/jaxcore/jaxcore-client) which includes other capabilities you might be interested in, such as [Jaxcore Spin](https://github.com/jaxcore/jaxcore-spin) motion control, a [Text-to-Speech](https://github.com/jaxcore/jaxcore-speak) system, [BumbleBee](https://github.com/jaxcore/bumblebee-hotword) a wake-word (like Alexa), and Sound/Microphone visualizations.

### Prerequisites

In order to test the live web demos, you must first install both:

- [Jaxcore Desktop application](https://github.com/jaxcore/jaxcore-electron)

- [Jaxcore Web Browser extension](https://github.com/jaxcore/browser-plugin)

**April-10-2019:** These projects are not yet released because the desktop app depends on DeepSpeech v0.5 which is not out yet.  In the meantime, the Listen NodeJS library can be used right now, and the web browser extension will be released hopefully later this week.  The headless version of the core piece of Jaxcore that is required for Listen support will be released at the same time.

NOTE: The DeepSpeech English language model in the desktop app is a very large download (1.8GB), but only needs to be installed once for use across all websites with Jaxcore support.  This all runs locally on a computer, no cloud services required, no signups, no API keys, and most importantly no eavesdropping.


### Live Demos

- Functionality Demo:
[https://jaxcore.github.io/jaxcore-listen/](https://jaxcore.github.io/jaxcore-listen/examples/demo)

- Vocabulary/Substitution Testing Tool:
[https://jaxcore.github.io/jaxcore-listen/examples/vocab-tester](https://jaxcore.github.io/jaxcore-listen/examples/vocab-tester)

- Voice Chess game: [https://chess.jaxcore.com](https://chess.jaxcore.com)

### Video Demos

- Voice Chess gameplay: [https://www.youtube.com/watch?v=faOfKd1eAQA](https://www.youtube.com/watch?v=faOfKd1eAQA)


## How It Works

![diagram](https://raw.githubusercontent.com/jaxcore/jaxcore-listen/master/diagram.png)

This diagram shows how the Jaxcore desktop app and browser extension are used to connect DeepSpeech and the Jaxcore Spin controllers to the web.  Jaxcore establishes a multi-node birectional communication channel from a web page to DeepSpeech and/or one or more Spin devices.  The browser extension will automatically switch to the active browser tab so only one tab can be controlled at a time.


## Web Client

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

For further reading, clone this repo and build try the web demos locally:

```
git clone https://github.com/jaxcore/jaxcore-listen.git
cd jaxcore-listen/
npm install
cd examples/demo
npm install
npm start
```

### Vocabulary Tester
The vocabulary tester can be used to create your own list of word substitutions as a primitive Natural Language Processor.  This is often necessary to catch situations where DeepSpeech recognizes similar sounding words (eg. "tree" instead of "three").  It may require a fair number of substitutions to achieve an acceptable level of accuracy, but this is still substantially easier than creating a new custom DeepSpeech language model.

```
git clone https://github.com/jaxcore/jaxcore-listen.git
cd jaxcore-listen/
npm install
cd examples/vocab-tester
npm install
npm start
```

The tools directory contains scripts to convert a CSV file of words into a JSON key/value list.  The `datetime.csv` would be a good one to copy as it is the most simple.

```
cd tools
cp datetime.csv mycustomlist.csv
node generate-substitutions.js mycustomlist.csv
```

That generates a new file `mycustomlist.json` with the first column as the key, and an array of the words.

See the [interpreters](https://github.com/jaxcore/jaxcore-listen/examples/vocab-tester/src/interpreters) directory for examples of how to create a function which performs a search and replace using the json interpreter data.

## NodeJS Module

#### NodeJS Module Installation

```
npm install jaxcore-listen
```

#### NodeJS Module Usage


```
import Listen from "jaxcore-listen";

const listen = new Listen({
	path: __dirname + '/../path/to/deepspeech/models'
});

listen.on('recognize', function(text) {
	console.log('you said:', text);
});
	
listen.start();

setTimeout(function() {
	Listen.stop();
}, 2000); // stop recording after 2 seconds
```

This requires the manual download of the DeepSpeech [English language model data](https://github.com/mozilla/DeepSpeech/releases/download/v0.4.1/deepspeech-0.4.1-models.tar.gz).  To download and extract use:

```
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.4.1/deepspeech-0.4.1-models.tar.gz
tar xvfz deepspeech-0.4.1-models.tar.gz
```

#### Run Node Microphone Demos

To see run the NodeJS examples locally you can use:

```
git clone https://github.com/jaxcore/jaxcore-listen.git
cd jaxcore-listen/
npm install
cd examples/node-microphone
npm install
```

Turn on your microphone and try the different recogntion modes:

```
node momentary.js
```

```
node continuous.js
```

## Jaxcore Listen Web API 

Momentary Recognition (manual start/stop):

```
Listen.start();

Listen.stop();
```

Continuous Recognition (segmented stream):

```
Listen.startContinuous({
	vadLevel; 'high',  // Voice Activity Level, use one of 'low','medium','high','max'
	continuousTimeout: 750,  // begins recognition after 1000ms of silemnce
	continuousMaxLength: 12000  // maximum length of clip to record
});

Listen.stopContinuous();
```

### Node API 

The NodeJS API is exactly the same but notice the lower-case "listen" instead is used:

```
listen.start();
listen.stop();
listen.startContinuous();
listen.stopContinuous();
```