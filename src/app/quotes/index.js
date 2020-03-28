import React from 'react';
import {render} from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './App';

// End App component
const renderApp = ()=> {
  render(
    <AppContainer>
      <App />
    </AppContainer>
  , document.getElementById('container'));
};

renderApp();

if(module.hot){
  module.hot.accept('./App', () => {
   renderApp()
  })
}
