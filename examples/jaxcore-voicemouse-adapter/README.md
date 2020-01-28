# Jaxcore Voice Mouse Example

This is a NodeJS example that connects DeepSpeech to the [Jaxcore](https://github.com/jaxcore/jaxcore) Mouse Service.  It uses voice commands to control the computer mouse.

The voice commands are:

- mouse left `N`  // moves mouse `N` pixels to the left
- mouse right `N`  // moves mouse `N` pixels to the right
- mouse up `N`  // moves mouse `N` pixels to the right
- mouse down `N`  // moves mouse `N` pixels to the right
- scroll left
- scroll right
- scroll up
- scroll down
- page up
- page down
- left click
- right click
- middle click


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

Go do the example directory:

```
cd examples/jaxcore-voicemouse-adapter
```

Install:

```
npm install
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