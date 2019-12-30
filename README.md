Jaxcore DeepSpeech Plugin
=======

Jaxcore is an open source cybernetic control system.
This plugin connects [Mozilla DeepSpeech](https://github.com/mozilla/DeepSpeech)
to [Jaxcore](https://github.com/jaxcore/jaxcore) to enable speech recognition support.  A related project, [BumbleBee-Hotword](), provides hotword support.

Together, these tools provide JavaScript developers an easy and straightforward way write "Alexa-like" interactive voice assistants, smart-home controls, and create science-fiction like voice-controlled web applications and games.
Run everything privately on your local computer without any 3rd party cloud computing services required.

## Install

```
git clone https://github.com/jaxcore/deepspeech-plugin
cd deepspeech-plugin
npm install
npm install git+https://github.com/jaxcore/jaxcore#master
```

## Download DeepSpeech Pre-Trained english model:

All the examples require the DeepSpeech english model to be at the root of the project.

```
# enter project directory
cd deepspeech-plugin

wget https://github.com/mozilla/DeepSpeech/releases/download/v0.6.0/deepspeech-0.6.0-models.tar.gz
tar xfvz deepspeech-0.6.0-models.tar.gz
rm deepspeech-0.6.0-models.tar.gz
```

## Examples

The examples provided will demonstrate the capabilities and limitations of the system, and provide a good place to start when writing your own "voice apps".  They come in 3 forms:

#### 1) Headless NodeJS Examples

These listen to the system microphone directly (via the command line `sox` utility) and have no user interface:

- todo: need to get them working again

#### 2) Client-Server Examples

These use a ReactJS client and NodeJS server to stream microphone audio from the browser to NodeJS:

- [web-basic-example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-basic-example) simple example of recording and speech recognition


- [web-hotword-example](https://github.com/jaxcore/deepspeech-plugin/tree/master/examples/web-hotword-example) advanced example using [BumbleBee-Hotword]() for hotword activation, audio visualization, and voice activated menus

#### 3) Jaxcore Browser Extension Examples

These require running the [Jaxcore Desktop Server]() and [web browser extension]().  This method allows developers to write voice-enabled web applications using only client-side JavaScript.  The Jaxcore application provides the speech recognition support from outside the browser.

- todo

