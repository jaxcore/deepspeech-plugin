# Jaxcore Kodi Speech Example

This is a NodeJS example that uses DeepSpeech to control [Kodi Media Center](https://kodi.tv/).

The voice commands to control Kodi implemented (so far) are

- up
- down
- left
- right
- select
- back
- pause
- play
- stop
- page up
- page down

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
cd examples/jaxcore-kodi-speech-adapter
```

Install:

```
npm install
```

Start the server:

```
node start.js
```

By default it connects to Kodi running on `localhost` port 9090 (you must configure Kodi remote control settings to allow access).

To connect to Kodi running on other computers on your home network use the `KODI_HOST` environment vaariable:

```
KODI_HOST=192.168.1.100 node start
```

#### Alternative deepspeech model directory

The example expect deepspeech-0.6-models to be located at the root of the `deepspeech-plugin` directory.  To specify an alternate location use the `DEEPSPEECH_MODEL` environment variable:

```
DEEPSPEECH_MODEL=/path/to/deepspeech/models node start.js
```