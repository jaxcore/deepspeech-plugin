This NodeJS example uses [BumbleBee Hotword](https://github.com/jaxcore/bumblebee-hotword-node) to turn DeepSpeech on and off.

Installing `speaker` with the optional parameters is necessary for the audio to play properly in Mac OSX.

```
npm install
npm install speaker --mpg123-backend=openal --no-save
node start.js
```