# JavaScript Voice Assistant Toolbox

This is a NodeJS example which combines all the key speech technologies necessary to write a voice assistant in JavaScript.

To create a voice assistant, the following speech technologies are required:

- speech-to-text
- text-to-speech
- hotword detection
- voice activity detection

This example combines libraries to accomplish these tasks allowing JavaScript developers to easily
create voice controlled applications.
Control devices in your home or create speech-based utilities and applications of any kind.
And it's all open source with 100% privacy.

The libraries used are:

- Speech Recognition:
	- [DeepSpeech](https://github.com/mozilla/DeepSpeech) - TensorFlow based speech-to-text engine
	- [Jaxcore DeepSpeech Plugin](https://github.com/jaxcore/deepspeech-plugin) - deepspeech background process launcher
	- [Node VAD](https://github.com/snirpo/node-vad) - voice activity detection
- Wake Word Detection:
	- [BumbleBee Hotword](https://github.com/jaxcore/bumblebee-hotword-node) - hotword detection based on [Porcupine](https://github.com/Picovoice/porcupine)
- Speech Synthesis:
	- [Jaxcore Say](https://github.com/jaxcore/jaxcore-say-node) - text-to-speech based on [mEspeak.js](https://www.masswerk.at/mespeak/)

### Usage

Follow the instructions to install the example on your computer.  Everything, including the DeepSpeech
speech recognition system, runs locally.

Make sure a microphone is active on the computer and speakers are turned on.  Attempt to activate
speech recognition by saying "BumbleBee".  You should hear a "speech recognition enabled" from the
speakers.  Any words spoken will be processed to text, then spoken back using speech synthesis.

Have Fun!

---

### Installation

```
git clone https://github.com/jaxcore/deepspeech-plugin
cd deepspeech-plugin
npm install
```

#### Download DeepSpeech Pre-Trained english model:

If the DeepSpeech models have not previously been downloaded, do so now (beware this is a large download >1.8GB):

```
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.6.0/deepspeech-0.6.0-models.tar.gz
tar xfvz deepspeech-0.6.0-models.tar.gz
rm deepspeech-0.6.0-models.tar.gz
```

Go do the voice assistant example directory:

```
cd examples/node-voiceassistant
```

Install:

```
npm install
npm install speaker
```

Mac OSX users will have to install an alternative speaker backend:

```
npm install speaker --mpg123-backend=openal --no-save
```

Start the server:

```
node start.js
```

#### Alternative deepspeech model directory

The example expect deepspeech-0.7.3-models to be located at the root of the `deepspeech-plugin` directory.  To specify an alternate location use the `DEEPSPEECH_MODEL` environment variable:

```
DEEPSPEECH_MODEL=/path/to/deepspeech-models node start.js
```