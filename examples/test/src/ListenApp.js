import React, { Component } from 'react';
import Jaxcore, { Listen } from 'jaxcore-client';

import ListenVisualizer from './ListenVisualizer';

class ListenApp extends Component {
  constructor() {
    super();
    
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
    
    global.app = this;
    
    this.connect();
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
  
        <ListenVisualizer width={300} height={300} isRecording={this.state.isRecording}/>
  
        
        <div>
          <button onMouseDown={e=>this.startRecording()} onMouseUp={e=>this.stopRecording()} onMouseOut={e=>this.stopRecording()}>Start Voice Recogition</button>
        </div>
        
        <div>
          <button onMouseDown={e=>this.setState({isRecording:true})} onMouseUp={e=>this.setState({isRecording:false})} onMouseOut={e=>this.setState({isRecording:false})}>Test Mic</button>
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
    });
  }
  
  stopRecording() {
    this.setState({
      isRecording: false
    }, () => {
      Listen.stop();
    });
  }
}

export default ListenApp;
