// This project was based off of this electron/react tutorial:
// https://www.codementor.io/randyfindley/how-to-build-an-electron-app-using-create-react-app-and-electron-builder-ss1k0sfer

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const path = require('path');
const isDev = require('electron-is-dev');

const Jaxcore = require('jaxcore');
const jaxcore = new Jaxcore();
jaxcore.addPlugin(require('jaxcore-deepspeech-plugin'));

// path to deepspeech model is relative to the /public directory
const MODEL_PATH = __dirname + '/../../../deepspeech-0.6.0-models';

if (isDev) process.env.NODE_ENV = 'dev';

let mainWindow;

const executeJavaScript = (win, codeStr, callback) => {
	// BEWARE:
	// executing "codeStr" is potentially harmful
	// it is recommented to only call functions with parameters encoded as JSON using JSON.stringify()
	if (win.webContents && win.webContents.executeJavaScript) {
		try {
			win.webContents.executeJavaScript(codeStr).then((result) => {
				callback(result);
			}).catch((e) => {
				console.error('executeJavaScript', e);
			});
		} catch (e) {
			console.error(e);
			process.exit();
		}
	}
	else {
		console.error('no webContents');
		process.exit();
	}
};

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 480,
		height: 640,
		webPreferences: {
			// allow code inside this window to use use native window.open()
			nativeWindowOpen: true,
			nodeIntegrationInWorker: true,
			preload: __dirname + '/preload.js'
		}
	});
	
	mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
	
	if (isDev) {
		// Open the DevTools.
		// BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
		// mainWindow.webContents.openDevTools();
	}
	
	mainWindow.on('closed', () => mainWindow = null);
	
	mainWindow.on('close', function (event) {
		console.log('close -> hide');
		event.preventDefault();
		mainWindow.hide();
	});
	
	ipcMain.on('client-ready', (event, arg) => {
		event.reply('electron-ready');
	});
	
	// start the jaxcore deepspeech service
	jaxcore.startService('deepspeech', {
		modelName: 'english',
		modelPath: MODEL_PATH,
		silenceThreshold: 200,
		vadMode: 'VERY_AGGRESSIVE',
		debug: true
	}, function (err, deepspeech) {
		console.log('deepspeech service ready');
		
		deepspeech.on('recognize', function (text, stats) {
			console.log('recognize', text, stats);
			
			// encode deepspeech results as JSON to be sent to the mainWindow
			let code = 'deepspeechResults(' + JSON.stringify(text) + ',' + JSON.stringify(stats) + ')';
			
			executeJavaScript(mainWindow, code, function () {
				console.log('exec code complete');
			});
		});
		
		// receive microphone audio stream from browser window
		ipcMain.on('stream-data', (event, data) => {
			// stream to the data to the DeepSpeech forked process
			deepspeech.streamData(data);
		});
		
	});
	
}

app.on('ready', function () {
	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
