const csvFilePath = __dirname + '/ascii.csv';
const csv = require('csvtojson');
let asciiJSON;
csv({
	noheader: true,
	headers: ['dec', 'hex', 'bin', 'char', '1', '2', '3', '4', '5', '6'],
}).fromFile(csvFilePath).then((jsonObj) => {
	console.log('ascii loaded', jsonObj);
	asciiJSON = jsonObj;
	
	if (process.argv[2] === 'writejson') {
		console.log('writing json');
		require('fs').writeFileSync(__dirname + '/ascii.json', JSON.stringify(jsonObj));
		process.exit();
	}
}).catch((e) => {
	console.error(e);
	process.exit();
});