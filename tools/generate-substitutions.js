// type:
// node generate-substitutions.js datetime.csv

const csv = require('csvtojson');

const csvFilePath = process.argv[2];

csv({
	noheader: true,
	output: 'csv'
}).fromFile(csvFilePath).then((result) => {
	// console.log('loaded', result);
	
	let keys = {};
	result.forEach(row => {
		let key = row[0];
		let newrow = [];
		for (let r=1;r<row.length;r++) {
			if (row[r]!='') {
				newrow.push(row[r]);
			}
		}
		keys[key] = newrow;
	});
	
	let outfile = csvFilePath.replace(/\.csv/,'.json');
	require('fs').writeFileSync(outfile, JSON.stringify(keys));
	console.log('wrote ', outfile);
	process.exit();
	
}).catch((e) => {
	console.error(e);
	process.exit();
});