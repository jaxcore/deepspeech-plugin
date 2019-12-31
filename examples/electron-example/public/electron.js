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
// const DeepSpeechPlugin = require('../../');
const DeepSpeechPlugin = require('jaxcore-deepspeech-plugin');
jaxcore.addPlugin(DeepSpeechPlugin);

const MODEL_PATH = __dirname + '/../../../deepspeech-0.6.0-models'; // path to deepspeech model is relative to the /public directory

if (isDev) process.env.NODE_ENV = 'dev';

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 480,
		height: 640,
		webPreferences: {
			// allow code inside this window to use use native window.open()
			nativeWindowOpen: true,
			nodeIntegrationInWorker: true,
			preload: __dirname+'/preload.js'
		}
	});
	
	mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
	
	if (isDev) {
		// Open the DevTools.
		//BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
		mainWindow.webContents.openDevTools();
	}
	
	mainWindow.on('closed', () => mainWindow = null);
	
	mainWindow.on('close', function (event) {
		console.log('close -> hide');
		event.preventDefault();
		mainWindow.hide();
	});
	
	// ipcMain.on('stream-data', (event, data) => {
	// 	// console.log('stream-data', data);
	// 	// event.returnValue = true;
	//
	// });
	
	ipcMain.on('client-ready', (event, arg) => {
		event.reply('electron-ready');
	});
	
	// start the jaxcore deepspeech service
	jaxcore.startService('deepspeech', {
		modelName: 'english',
		modelPath: MODEL_PATH,
	}, function(err, deepspeech) {
		console.log('deepspeech service ready');
		
		deepspeech.on('recognize', function(text, stats) {
			console.log('recognize', text, stats);
		});
		
		ipcMain.on('stream-data', (event, data) => {
			deepspeech.streamData(data);
		});
		
		// startSocketServer(deepspeech);
	});
	
}

app.on('ready', function() {
	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// app.on('activate', () => {
// 	if (mainWindow === null) {
// 		console.log('ACTIVATE?')
// 		// createWindow();
// 	}
// });