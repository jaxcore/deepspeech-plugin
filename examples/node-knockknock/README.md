# Knock, Knock Jokes Example

This is a NodeJS example which create a Knock, Knock joke telling chatbot.

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

Go do the knock, knock example directory:

```
cd examples/node-knockknock
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

The example expect deepspeech-0.6-models to be located at the root of the `deepspeech-plugin` directory.  To specify an alternate location use the `DEEPSPEECH_MODEL` environment variable:

```
DEEPSPEECH_MODEL=/path/to/deepspeech/models node start.js
```

If you haven't installed the deepspeech models, see the instructions [here](https://github.com/jaxcore/deepspeech-plugin)