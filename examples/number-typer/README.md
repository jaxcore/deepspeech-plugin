# Number Typer

This is a NodeJS example that connects [DeepSpeech](https://github.com/mozilla/DeepSpeech) to the [Jaxcore](https://github.com/jaxcore/jaxcore) Keyboard Service.  It uses speech recognition to type numbers keys (and more) on the computer.  This works system-wide - use it for a Calculator or Spreadsheet application, terminal commands, or anything else.  You'll never have to type another number with your hands again.

For more information about the Jaxcore DeepSpeech plugin see [here](https://github.com/jaxcore/deepspeech-plugin).

## Voice Commands

Supported words / commands.  Saying these words presses the corresponding key(s) on the keyboard:

- all numbers:
	- "one" `1`
	- "fifty" `50`
	- "negative one fifty" `-150`
	- "five hundred" `500`
	- "five thousand and five" `5005`
	- "twenty four million and five" `24000005`
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
npm install
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