const chai = require('chai');
const expect = chai.expect;
const NumbersDatesNLP = require('../lib/numbers-nlp');

let numberParser = new NumbersDatesNLP({
	numbers: true
});

// let dateParser = new NumbersDatesNLP({
// 	dates: true
// });
//
// let numbersAndDatesParser = new NumbersDatesNLP({
// 	numbers: true,
// 	dates: true
// });

describe('Color class constructor', function() {
	it('accepts strings', function(done) {
		expect(numberParser.parse("one")).to.be.equal('1');
		done();
	});
});

// let keys = parseKeys('one space to select all delete five option right nine greater than semi colon');
// let keys = parseKeys('one space to back space five dot dash nine greater than semi colon select all copy right enter paste shift option left shift option left shift option left');
// let keys = parseKeys('one to three for shift option left shift option left shift option left');
// let keys = parseKeys('one option shift right two option shift right three option shift right');
// let keys = parseKeys('one to three for shift left shift left shift left copy left paste left left enter option shift right copy');
// let keys = parseKeys('one to three shift left shift left shift left one shift left copy semi colon twelve');
// let keys = parseKeys('for i\'ve');
// let keys = parseKeys('there');
// console.log(keys);
// process.exit();


// setTimeout(function() {
// // keyboard.keyPress('4');
// // keyboard.keyPress('*');
// // keyboard.keyPress('4');
// // keyboard.keyPress('=');
// // keyboard.keyPress('+');
// // keyboard.keyPress('2');
// // keyboard.keyPress('=');
//
// // process.exit();
// }, 2000);

// console.log('\nnumbers:', wordsToNumbers("twenty four million", { impliedHundreds: true }));
// console.log('\nnumbers:', parseKeys("negative one fifty", { impliedHundreds: true }));
// process.exit();
