const csvFilePath = __dirname + '/ascii.csv';
const csv = require('csvtojson');

csv({
	noheader: true,
	headers: ['dec', 'hex', 'bin', 'char', '1', '2', '3', '4', '5', '6'],
}).fromFile(csvFilePath).then((ascii) => {
	// console.log('ascii loaded', ascii);
	
	const asciiChars = {};
	
	ascii.forEach((row) => {
		let d = row["dec"];
		let c = row["char"];
		if (d === '32') {
			c = " ";
		}
		let words = [];
		for (let w = 1; w < 10; w++) {
			if (row[w]!=='') {
				words.push(row[w]);
			}
		}
	
		asciiChars[d] = [c,words];
	});
	
	require('fs').writeFileSync(__dirname + '/ascii.json', JSON.stringify(asciiChars));
	console.log('wrote ascii.json');
	process.exit();
	
}).catch((e) => {
	console.error(e);
	process.exit();
});

// https://en.wikipedia.org/wiki/C0_and_C1_control_codes