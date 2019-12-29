import ascii, {asciiData} from './ascii.js';
import chess, {chessData} from './chess.js';
import datetime, {datetimeData} from './datetime.js';

const interpreterData = {
	ascii: asciiData,
	chess: chessData,
	datetime: datetimeData
};

export {interpreterData};

const interpreters = {
	ascii,
	chess,
	datetime
};

export default interpreters;