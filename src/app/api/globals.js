global.process = require('process');
global.Buffer = require('buffer').Buffer
process.platform = 'browser_shim',
process.env = {
	REACT_APP_SC_ATTR: 'data-styled-myapp',
  	SC_ATTR: 'data-styled-myapp'
}
console.log("reequired necessary functions");