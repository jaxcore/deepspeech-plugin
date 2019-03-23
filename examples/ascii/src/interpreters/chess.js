import chessData from './chess.json';

function sortWordLength(a, b) {
	if (a[0].length === b[0].length) {
		return 0; //parseInt(a[1]) > parseInt(b[1]);
	}
	return a[0].length < b[0].length ? 1 : -1;
}

let chessWords = [];

function loadChess() {
	
	for (let key in chessData) {
		let words = chessData[key];
		words.forEach(word => {
			chessWords.push([word,key]);
		})
	}
	chessWords.sort(sortWordLength);
	
	// debugger;
	
	// for (dec in ascii) {
	// 	ch = ascii[dec][0];
	// 	words = ascii[dec][1];
	// 	dec = parseInt(dec);
	// 	if (dec >= 65 && dec <= 90) { // A-Z
	// 		let lch = ch.toLowerCase();
	// 		let letter = dec + 32;
	// 		let letterwords = ascii[letter][1];
	// 		letterwords.forEach((lw) => {
	// 			words.unshift("upper case " + lw);
	// 			words.unshift("capital " + lw);
	// 		});
	// 		// words = words.concat(letterwords);
	// 		// words.unshift("uppercase " + lch);
	// 		words.unshift("upper case " + lch);
	// 		words.unshift("capital " + lch);
	// 	} else if (dec >= 97 && dec <= 122) { // a-z
	// 		// words.unshift("lowercase " + ch);
	// 		words.unshift("letter " + ch);
	// 		words.unshift("lower case " + ch);
	// 		words.unshift(ch);
	// 	}
	// 	if (words.length === 0) {
	// 		asciiWords.push([ch, dec]);
	// 	} else {
	// 		words.forEach(function (word) {
	// 			asciiWords.push([word, dec]);
	// 		});
	// 	}
	// }
	// asciiWords.sort(sortWordLength);
	
	
	const chessInterpreter = function(text, prevText, prevIndex, afterBefore) {
		let index = null;

		let w;
		let strIndex;
		
		for (let i = 0; i < chessWords.length; i++) {
			w = chessWords[i][0];

			
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
			let found = chessWords[index][0];
			let key = chessWords[index][1];
			// let ch = ascii[dec][0];
			let before = text.substring(0, strIndex);
			let after = text.substring(strIndex + found.length + 1);
			let ret = []; //b,found,a];
			
			console.log('found chess:', found);
			
			let b = chessInterpreter(before, text, strIndex, 0);
			let a = chessInterpreter(after, text, strIndex, 1);

			if (b) ret.push(b);

			ret.push(key);
			
			if (a) ret.push(a);
			let r = ret.flat();
			return r;
		} else {
			return [];
		}
	};
	
	
	
	return chessInterpreter;
}

const interpreter = loadChess();

export {chessData, chessWords};

export default interpreter;