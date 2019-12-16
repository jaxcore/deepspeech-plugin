Jaxcore Speech
=======

Jaxcore Speech is an open source JavaScript voice control system, based on Mozilla
[DeepSpeech](https://github.com/mozilla/DeepSpeech) (speech-to-text), [NodeVAD](https://github.com/snirpo/node-vad) (voice activity detection),
and [RobotJS](https://github.com/octalmage/robotjs).

Jaxcore Speech can run independently, or as a plugin for [Jaxcore](https://jaxcore.com), a cybernetic control system which provides the ability to control computers (mouse, keyboard, volume), media software (Kodi), Chromcast, Sonos and other network devices and applications.

Using Jaxcore and Jaxcore Speech it is easy to write "Alexa-like" interactive voice assistants, smart-home controls, or add science-fiction like voice/motion control to web applications and games.  Run everything privately on your local computer without any 3rd party cloud computing services required.

## Install

```
git clone https://github.com/jaxcore/jaxcore-speech
cd jaxcore-speech
npm install
```

## Download Pre-Trained DeepSpeech model:

```
wget https://github.com/mozilla/DeepSpeech/releases/download/v0.6.0/deepspeech-0.6.0-models.tar.gz
tar xfvz deepspeech-0.6.0-models.tar.gz
rm deepspeech-0.6.0-models.tar.gz
```

## Run the microphone test examples:

Momentary recording example (press any key to start recording, press any key again to stop)

```
node examples/node-microphone/momentary.js
```

Continuous recording example (press any key to start continuously recording, press any key again to stop)

```
node examples/node-microphone/momentary.js
```

## Run the mouse control adapter

Using this test script you can control your computer mouse with your voice:

```
node examples/speech-mouse-adapter/start.js
```

Mouse adapter voice commands are:

- "scroll down"
- "scroll down 100" // scrolls down 100 pixels
- "scroll up"
- "scroll up 100" // scrolls up 100 pixels
- "page down" // presses page down key
- "page up" // presses page down key
- "up" // presses up arrow key
- "down" // presses down arrow key
- "left" // presses left arrow key
- "right" // presses right arrow key
- "mouse up 100" // moves mouse up 100 pixels
- "mouse down 100" // moves mouse down 100 pixels
- "mouse left 100" // moves mouse left 100 pixels
- "mouse right 100" // moves mouse right 100 pixels
- "left click" // clicks left mouse button
- "right click" // clicks right mouse button
- "middle click" // clicks middle mouse button

## Web Connectivity Examples

Coming Soon (rewrite in progress)
