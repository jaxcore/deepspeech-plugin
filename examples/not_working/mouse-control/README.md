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
npm install
```

Start the server:

```
node start.js
```

#### Alternative deepspeech model directory

The example expect deepspeech-0.7.3-models to be located at the root of the `deepspeech-plugin` directory.  To specify an alternate location use the `DEEPSPEECH_MODEL` environment variable:

```
DEEPSPEECH_MODEL=/path/to/deepspeech/models node start.js
```

If you haven't installed the deepspeech models, see the instructions [here](https://github.com/jaxcore/deepspeech-plugin)