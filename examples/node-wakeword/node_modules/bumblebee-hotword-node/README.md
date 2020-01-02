# BumbleBee Hotword for NodeJS

![screenshot](https://raw.githubusercontent.com/jaxcore/bumblebee-hotword/master/logo.png)

This is a stripped down and repackaged version of the excellent [Porcupine](https://github.com/Picovoice/Porcupine) wake word (hotword) system. This requires no cloud services and is freely available to use under the Apache 2.0 license (GPLv3 compatible).

This is the NodeJS version of BumbleBee.  If you need hotword detection in the browser or ElectronJS see the:

- [https://github.com/jaxcore/bumblebee-hotword](https://github.com/jaxcore/bumblebee-hotword)

BumbleBee Node starts recording the system microphone and emits an event when it hears the available hotwords.

## Examples

- [Basic Example](https://jaxcore.github.io/bumblebee-hotword-node/basic-example/) - most simple example possible
- [Full Example](https://jaxcore.github.io/bumblebee-hotword-node/full-example/) - all options available, plays a sound when a hotword is detected

## Install

Using npm:

```
npm install bumblebee-hotword-node
```

### Quick Start

```
const BumbleBee = require('bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');

bumblebee.on('hotword', function (hotword) {
	console.log('Hotword Detected:', hotword);
});

bumblebee.start();
```

### Hotwords

The hotwords available by default are:

* bumblebee
* grasshopper
* hey edison
* porcupine

Due to processing time it is recommended to only add the hotwords that need to be used.  The hotword spoken can be retreived in the `.on('hotword')` event:

```
bumblebee.addHotword('bumblebee');
bumblebee.addHotword('grasshopper');
bumblebee.addHotword('hey_edison');
bumblebee.addHotword('porcupine');
bumblebee.addHotword('terminator');

bumblebee.on('hotword', function(hotword) {
	console.log('hotword detected:', hotword);
});
```

The [Picovoice hotwords open source hotwords](https://github.com/Picovoice/Porcupine/tree/master/resources/keyword_files) are freely usable under the Apache 2.0 license.  Custom hotwords can be licensed from [https://picovoice.ai](https://picovoice.ai/).

### Sensitivity

Hotword detection sensitivity (0.0 to 1.0) is configurable only before the first call to `bumblebee.start()`

```
bumblebee.setSensitivity(0.8);
```

### Disable BumbleBee

Use the stop() method to disable the microphone and all processing:

```
bumblebee.stop();
```

### Audio Data

Bumblebee records audio from the microphone in 16bit/16khz PCM format and emits a stream of "data" events so the audio can be processed by other systems (such as [DeepSpeech](https://github.com/jaxcore/deepspeech-plugin)):

```
bumblebee.on('data', function(data) {
	console.log('data', data);
});
```


## Run Examples Locally

Clone this repo, then...

For the [basic](https://jaxcore.github.io/bumblebee-hotword/basic-example/) example:

```
cd examples/basic-example
node start.js
```

For the [full](https://jaxcore.github.io/bumblebee-hotword/full-example/) example:

```
cd examples/full-example
npm install
npm install speaker --mpg123-backend=openal --no-save
node start.js
```

For the DeepSpeech speech recognition and hotword example, see instructions at:

- [https://github.com/jaxcore/deepspeech-plugin](https://github.com/jaxcore/deepspeech-plugin)

## License

This repository is licensed under Apache 2.0.  See [Porcupine](https://github.com/Picovoice/Porcupine) for more details.
