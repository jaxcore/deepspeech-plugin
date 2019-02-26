import React, {Component} from 'react';

const volumeAudioProcess = function (event) {
	var buf = event.inputBuffer.getChannelData(0);
	var bufLength = buf.length;
	var sum = 0;
	var x;
	
	// Do a root-mean-square on the samples: sum up the squares...
	for (var i = 0; i < bufLength; i++) {
		x = buf[i];
		if (Math.abs(x) >= this.clipLevel) {
			this.clipping = true;
			this.lastClip = window.performance.now();
		}
		sum += x * x;
	}
	
	// ... then take the square root of the sum.
	var rms = Math.sqrt(sum / bufLength);
	
	// Now smooth this out with the averaging factor applied
	// to the previous sample - take the max here because we
	// want "fast attack, slow release."
	this.volume = Math.max(rms, this.volume * this.averaging);
};

class ListenVisualizer extends Component {
	constructor(props) {
		super();
		
		this.width = props.width;
		this.height = props.height;
		
		this.canvasRef = React.createRef();
		
		this.state = {
			isRecording: false,
			results: [],
			connectedExtension: false
		};
		
		this.audioContext = null;
		this.meter = null;
		//this.ctx = null;
		// var WIDTH=500;
		// var HEIGHT=50;
		// var rafID = null;
		this.mediaStreamSource = null;
		this._draw = this.draw.bind(this);
	}
	
	componentWillReceiveProps(props) {
		if (props.width && props.height) {
			this.setSize(props.width, props.height);
		}
		
		if ('isRecording' in props) {
			this.setIsRecording(props.isRecording);
		}
	}
	
	setSize(w, h) {
		this.canvasRef.current.width = w;
		this.canvasRef.current.height = h;
		this.width = w;
		this.height = h;
		this.draw();
	}
	
	componentDidMount() {
		this.setSize(this.props.width, this.props.height);
		
	}
	
	render() {
		return (<canvas ref={this.canvasRef} width="0" height="0"/>)
	}
	
	createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
		var processor = audioContext.createScriptProcessor(512);
		processor.onaudioprocess = volumeAudioProcess;
		processor.clipping = false;
		processor.lastClip = 0;
		processor.volume = 0;
		processor.clipLevel = clipLevel || 0.98;
		processor.averaging = averaging || 0.95;
		processor.clipLag = clipLag || 750;
		
		// this will have no effect, since we don't copy the input to the output,
		// but works around a current Chrome bug.
		processor.connect(audioContext.destination);
		
		processor.checkClipping =
			function () {
				if (!this.clipping)
					return false;
				if ((this.lastClip + this.clipLag) < window.performance.now())
					this.clipping = false;
				return this.clipping;
			};
		
		processor.shutdown =
			function () {
				this.disconnect();
				this.onaudioprocess = null;
			};
		
		return processor;
	}
	
	setIsRecording(isRecording) {
		if (this.isRecording === isRecording) {
			return;
		}
		this.isRecording = isRecording;
		if (isRecording) this.startRecording();
		else this.stopRecording();
	}
	
	stopRecording() {
	
	}
	
	startRecording() {
		let ctx = this.canvasRef.current.getContext('2d');
		
		// grab our canvas
		// ctx = document.getElementById("meter").getContext("2d");
		
		// monkeypatch Web Audio
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		
		// grab an audio context
		this.audioContext = new AudioContext();
		
		
		const success = (stream) => {
			// Create an AudioNode from the stream.
			this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
			
			// Create a new volume meter and connect it.
			this.meter = this.createAudioMeter(this.audioContext);
			this.mediaStreamSource.connect(this.meter);
			
			// kick off the visual updating
			// this.drawLoop();
			this.startDrawing();
		};
		
		const fail = (e) => {
			console.log('fail');
			debugger;
		};
		
		// Attempt to get audio input
		try {
			// monkeypatch getUserMedia
			navigator.getUserMedia =
				navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia;
			
			// ask for an audio input
			navigator.getUserMedia(
				{
					"audio": {
						"mandatory": {
							"googEchoCancellation": "false",
							"googAutoGainControl": "false",
							"googNoiseSuppression": "false",
							"googHighpassFilter": "false"
						},
						"optional": []
					},
				}, success, fail);
		} catch (e) {
			alert('getUserMedia threw exception :' + e);
		}
	}
	
	startDrawing() {
		if (!this.isDrawing) {
			this.isDrawing = true;
			this.draw()
		}
	}
	
	stopDrawing() {
		this.isDrawing = false;
	}
	
	draw() {
		if (!this.canvasRef) {
			console.log('no canvas');
			return;
		}
		
		let ctx = this.canvasRef.current.getContext('2d');
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this.width, this.height);
		
		if (!this.props.isRecording || !this.meter) {
			console.log('not drawing');
		}
		else {
			console.log('IS drawing');
			
			
			// clear the background
			ctx.clearRect(0, 0, this.width, this.height);
			
			// check if we're currently clipping
			if (this.meter.checkClipping()) {
				ctx.fillStyle = "red";
			} else {
				ctx.fillStyle = "green";
			}
			ctx.fillRect(0, 0, this.meter.volume * this.width * 1.4, this.height);
			
			if (this.isDrawing) {
				
				window.requestAnimationFrame(this._draw);
			}
			else {
				console.log('nope isDrawing');
			}
		}
	}
	
}

export default ListenVisualizer;