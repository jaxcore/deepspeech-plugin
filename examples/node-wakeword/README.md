This NodeJS example uses [BumbleBee Hotword](https://github.com/jaxcore/bumblebee-hotword-node) to turn DeepSpeech on and off.

```
npm install
```

MacOSX users will need to install the alternative speaker module:  Installing `speaker` with the optional parameters is necessary for the audio to play properly in Mac OSX.

```
npm install speaker --mpg123-backend=openal
```

```
node start.js
```

#### Alternative deepspeech model directory

The example expect deepspeech-0.7.3-models to be located at the root of the `deepspeech-plugin` directory.  To specify an alternate location use the `DEEPSPEECH_MODEL` environment variable:

```
DEEPSPEECH_MODEL=/path/to/deepspeech/models node start.js
```

If you haven't installed the deepspeech models, see the instructions [here](https://github.com/jaxcore/deepspeech-plugin)
