const csv = require('csvtojson');

const csvFilePath = __dirname + '/chess.csv';

csv({
	noheader: true,
	output: 'csv'
}).fromFile(csvFilePath).then((result) => {
	let keys = {};
	result.forEach(row => {
		let key = row.shift();
		let newrow = [];
		for (let r=0;r<row.length;r++) {
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