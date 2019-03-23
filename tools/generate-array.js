const csvFilePath = process.argv[2]; //__dirname + '/ascii.csv';

const csv = require('csvtojson');
csv({
	noheader: true,
	output: 'csv'
}).fromFile(csvFilePath).then((result) => {
	console.log('loaded', result);
	
	let outfile = csvFilePath.replace(/\.csv/,'.json');
	require('fs').writeFileSync(outfile, JSON.stringify(result));
	console.log('wrote ', outfile);
	process.exit();
	
}).catch((e) => {
	console.error(e);
	process.exit();
});