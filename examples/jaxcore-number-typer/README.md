# Number Typer

This is a NodeJS example which uses [DeepSpeech](https://github.com/mozilla/DeepSpeech) and [robotjs]() to type numbers on a desktop computer using your voice.

For more information about the Jaxcore DeepSpeech plugin see [here](https://github.com/jaxcore/deepspeech-plugin).



## Voice Commands

Supported words / commands.  Saying these words presses the corresponding key(s) on the keyboard:

- all numbers:
	- "one" `1`
	- "fifty" `50`
	- "twenty four million and five" `24000005`
- floating point numbers:
	- "one point five" `1.5`
	- "sixteen decminal zero one" `16.01`
- all math-related symbols:
	- "plus" `+`
	- "minus" `-`
	- "times" `*`
	- "equals" `=`
	- "diviced by" `/`
- specific keys:
	- "space"
	- "tab"
	- "enter"
	- "escape"
	- "home"
	- "end"
	- "delete"
	- "backspace"
	- "comma" `,`
	- "colon" `:`
	- "semi colon" `;`
	- "left brace" `[` or "right brace" `]`
	- "left curly backet" `{`or "left curly backet" `]`
	- "left bracket `(` or "right bracket" `)`
- arrow keys:
	- "up"
	- "down"
	- "left"
	- "right"
- modifier + direction:
	- "shift left"
	- "option left" OR "alt left"
	- "control left"
	- "command left"
	- "option shift left"
- "hold shift" and "release shift"
- "select all" - presses `Command-A`
- "copy" - presses `Control-C` (win/linux) and `Command-C` (mac)
- "paste" - presses `Control-V` (win/linux) or `Command-V` (mac)


## Installation

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

If there is an npm error, try deleting `package-lock.js` and try again.

Start the server:

```
node start.js
```

#### Alternative deepspeech model directory

The example expect deepspeech-0.6-models to be located at the root of the `deepspeech-plugin` directory.  To specify an alternate location use the `DEEPSPEECH_MODEL` environment variable:

```
DEEPSPEECH_MODEL=/path/to/deepspeech/models node start.js
```

