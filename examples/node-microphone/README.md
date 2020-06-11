This example runs entirely in NodeJS, and starts the system microphone for recording.

```
npm install
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