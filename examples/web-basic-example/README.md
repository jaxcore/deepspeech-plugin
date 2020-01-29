# Web Basic Example

This is an example of a ReactJS web application streaming microphone audio from the browser
to a NodeJS server and transmitting the DeepSpeech results back to the browser.

#### Install

```
yarn install
```

#### Run ReactJS Client

```
yarn start
```

#### Run NodeJS Server (in a separate terminal window)

```
node server.js
```

#### Alternative deepspeech model directory

The example expect deepspeech-0.6-models to be located at the root of the `deepspeech-plugin` directory.  To specify an alternate location use the `DEEPSPEECH_MODEL` environment variable:

```
DEEPSPEECH_MODEL=/path/to/deepspeech-models node server.js
```

If you haven't installed the deepspeech models, see the instructions [here](https://github.com/jaxcore/deepspeech-plugin)