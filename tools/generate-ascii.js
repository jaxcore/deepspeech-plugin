const csv = require('csvtojson');

const csvFilePath = __dirname + '/ascii.csv';

csv({
	noheader: true,
	output: 'csv'
	// headers: ['dec', 'char', '1', '2', '3', '4', '5', '6','7'],
}).fromFile(csvFilePath).then((ascii) => {
	// console.log('ascii loaded', ascii);
	
	const asciiChars = {};
	
	ascii.forEach((row) => {
		let d = row[0];
		let c = row[1];
		
		if (d === '32') {
			c = " ";
		}
		
		let words = [];
		for (let w = 2; w < 10; w++) {
			if (row[w]!=='' && row[w]!==undefined && row[w]!==null) {
				words.push(row[w]);
			}
		}
		
		console.log(words);
		
		if (words.length) {
			asciiChars[d] = [c,words];
		}
		else asciiChars[d] = [c];
	});
	
	require('fs').writeFileSync(__dirname + '/ascii.json', JSON.stringify(asciiChars));
	console.log('wrote ascii.json');
	process.exit();
	
}).catch((e) => {
	console.error(e);
	process.exit();
});

// https://en.wikipedia.org/wiki/C0_and_C1_control_codes