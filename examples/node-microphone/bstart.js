const BumbleBee = require('../../../bumblebee-hotword-node');
const bumblebee = new BumbleBee();
bumblebee.addHotword('bumblebee');

bumblebee.on('hotword', function (hotword) {
	console.log('Hotword Detected:', hotword);
});

bumblebee.start();
