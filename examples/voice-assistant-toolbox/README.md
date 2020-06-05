# JavaScript Voice Assistant Toolbox


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
npm install
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

The example expect deepspeech-0.7-models to be located at the root of the `deepspeech-plugin` directory.  To specify an alternate location use the `DEEPSPEECH_MODEL` environment variable:

```
DEEPSPEECH_MODEL=/path/to/deepspeech-models node start.js
```

If you haven't installed the deepspeech models, see the instructions [here](https://github.com/jaxcore/deepspeech-plugin)