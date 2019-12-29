import React from 'react';
import ReactDOM from 'react-dom';
import InterpreterApp from './InterpreterApp';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<InterpreterApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
