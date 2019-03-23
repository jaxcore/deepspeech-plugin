import ascii, {asciiData} from './ascii.js';
import chess, {chessData} from './chess.js';

const interpreterData = {
	ascii: asciiData,
	chess: chessData
};

export {interpreterData};

const interpreters = {
	ascii,
	chess
};

export default interpreters;