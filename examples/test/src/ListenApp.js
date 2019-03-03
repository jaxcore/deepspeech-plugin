import React, { Component } from 'react';
import Jaxcore, { Listen, MonauralScope } from 'jaxcore-client';
// import MicScope from './MicScope';

class ListenApp extends Component {
  constructor() {
    super();
    
    this.canvasRef = React.createRef();
    
    this.state = {
      isRecording: false,
      results: [],
      connectedExtension: false
    };
    
    global.app = this;
  }
  
  componentDidMount() {
    Jaxcore.subscribe((jaxcoreState) => {
      
      const {state} = this;
      state.connectedExtension = jaxcoreState.connectedExtension;
      this.setState(state);
      
    });
    
    this.connect();
  
    this.micVisualization = new MonauralScope(this.canvasRef.current);
    this.micVisualization.draw();
  }
  
  connect() {
    Listen.on('recognized', (text) => {
      let results = this.state.results;
      results.unshift(text);
      this.setState({
        results
      });
    });
    
    Jaxcore.connectSpins(spin => {
      console.log('spin connected', spin);
      
      spin.on('spin', (direction) => {
        console.log('spin', direction, spin.state.spinPosition);
      });
      spin.on('button', (pushed) => {
        console.log('x button', pushed);
      });
      spin.on('knob', (pushed) => {
        console.log('knob', pushed);
      });
      
    });
  };
  
  render() {
    return (
      <div className="App">
  
        {/*<MicScope width={300} height={300} isRecording={this.state.isRecording}/>*/}
        <canvas ref={this.canvasRef} width="300" height="300"/>
        
        <div>
          <button onMouseDown={e=>this.startRecording()} onMouseUp={e=>this.stopRecording()} onMouseOut={e=>this.stopRecording()}>Start Voice Recogition</button>
        </div>
        
        <div>
          <button onMouseDown={e=>this.startMicVisualization()} onMouseUp={e=>this.stopMicVisualization()} onMouseOut={e=>this.stopMicVisualization()}>Test Mic</button>
        </div>
  
        <div>
          Listen Status {this.state.isRecording?'Recording':'Stopped'}
        </div>
        <div>
          Extension Status {this.state.connectedExtension?'Connected':'Disconnected'}
        </div>
  
        <br/>
        
        <div>
          Results:
        </div>
        <ul>
          {this.state.results.map((r,i) => {
            return (<li key={i}>{r}</li>);
          })}
        </ul>
      </div>
    );
  }
  
  startRecording() {
    this.setState({
      isRecording: true
    }, () => {
      Listen.start();
      this.startMicVisualization();
    });
  }
  
  stopRecording() {
    this.setState({
      isRecording: false
    }, () => {
      Listen.stop();
      this.stopMicVisualization();
    });
  }
  
  startMicVisualization() {
    this.setState({isRecording:true});
    this.micVisualization.startRecording();
  }
  
  stopMicVisualization() {
    this.setState({isRecording:false});
    this.micVisualization.stopRecording();
  }
}

export default ListenApp;
