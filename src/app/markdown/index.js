import React from 'react';
import {render} from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './App';
let script = document.getElementById("markdownScript");
let targetId = "container";
let fullScreen = true;

if(script){
	let temp = script.getAttribute("targetId");
	if(temp){
		targetId = temp;
	}

  if(script.getAttribute("fullScreen") === "false")
    fullScreen = false;
}

// End App component
const renderApp = ()=> {
  render(
    <AppContainer>
      <App fullScreen={fullScreen} />
    </AppContainer>
  , document.getElementById(targetId));
};

renderApp();

if(module.hot){
  module.hot.accept('./App', () => {
   renderApp()
  })
}
