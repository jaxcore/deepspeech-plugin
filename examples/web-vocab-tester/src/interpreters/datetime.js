// todo: this is not done yet


import datetimeData from './datetime.json';
import wordsToNumbers from 'words-to-numbers';

function sortWordLength(a, b) {
	if (a[0].length === b[0].length) {
		return 0; //parseInt(a[1]) > parseInt(b[1]);
	}
	return a[0].length < b[0].length ? 1 : -1;
}

const datetimeWords = [];



function replacements(text) {
	let index = null;
	let w;
	let strIndex;
	
	for (let i = 0; i < datetimeWords.length; i++) {
		w = datetimeWords[i][0];
		
		let same = false;
		if (text === w) {
			index = i;
			strIndex = 0;
			same = true;
			break;
		} else {
			let reg = new RegExp("^" + w + " | " + w + " | " + w + "$");
			let m = text.match(reg);
			if (m) {
				index = i;
				strIndex = m.index;
				break;
			}
		}
	}
	if (index !== null) {
		let found = datetimeWords[index][0];
		let key = datetimeWords[index][1];
		// let ch = ascii[dec][0];
		let before = text.substring(0, strIndex);
		let after = text.substring(strIndex + found.length + 1);
		let ret = []; //b,found,a];
		
		console.log('found datetime:', found);
		
		if (before) {
			let b = replacements(before);
			if (b) ret.push(b);
		}
		
		ret.push(key);
		
		if (after) {
			let a = replacements(after);
			if (a) ret.push(a);
		}
		let r = ret.flat();
		return r;
	} else {
		return [text.trim()];
	}
}

const weekdayMap = {};
const weekdays = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
weekdays.forEach(function(m) {
	weekdayMap[m] = true;
});

const monthMap = {};
const months = ['january','frebruary','march','april','may','june','july','august','september','october','november','december'];
months.forEach(function(m) {
	monthMap[m] = true;
});

function loadDatetime() {
	
	for (let key in datetimeData) {
		let words = datetimeData[key];
		
		words.forEach(word => {
			datetimeWords.push([word,key]);
		})
	}
	
	datetimeWords.sort(sortWordLength);
	
	const datetimeInterpreter = function(text) {
		let keys = replacements(text);
		console.log('orig', keys);
		
		// keys = keys.map(function(key) {
		// 	if (typeof key === 'string' && /[0-9]+/.test(key)) {
		// 		return {
		// 			month: months.indexOf(key)
		// 		};
		// 	}
		// 	return key;
		// });
		// console.log('months', keys);
		
		keys = keys.map(wordsToNumbers);
		console.log('numbers', keys);
		
		keys = keys.map(function(key) {
			if (key.indexOf(' ')) {
				return key.split(' ');
			}
			return key;
		}).flat();
		
		keys = keys.map(function(key) {
			if (/[0-9]+/.test(key)) {
				return parseInt(key);
			}
			return key;
		});
		
		keys = keys.map(function(key) {
			if (typeof key === 'string' && key in monthMap) {
				return {
					month: months.indexOf(key)
				};
			}
			return key;
		});
		console.log('months', keys);
		
		keys = keys.map(function(key) {
			if (typeof key === 'string' && key in weekdayMap) {
				return {
					weekday: weekdays.indexOf(key)
				};
			}
			return key;
		});
		console.log('weekdays', keys);
		
		// debugger;
		return new Date();
	};
	
	return datetimeInterpreter;
}

const interpreter = loadDatetime();

interpreter("thursday he pro first twenty nineteen at ten thirty five p m");

export {datetimeData, datetimeWords};

export default interpreter;