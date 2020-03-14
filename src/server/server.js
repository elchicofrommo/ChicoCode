'use strict';

import logger from './utils/Logger';

logger.info('Starting chico_express ... ')

var express = require('express');
//var fileRoutes = express.Router();
//var defaultRoutes = express.Router();
var staticRoutes = express.Router();
var reactRoutes = express.Router();
var path = require('path');

var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var fileUpload = require("express-fileupload");
var cors = require('cors');

var app = express();
//defaultRoutes.use(express.json()) // for parsing application/json
//defaultRoutes.use(bodyParser.urlencoded({ extended: false })) // for parsing application/x-www-form-urlencoded


/*fileRoutes.use(express.json());
fileRoutes.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));*/

logger.info(`Connecting DB to ${process.env.DATABASE_URI}` )
mongoose.connect(process.env.DATABASE_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}); 


function simpleRequestLogger(req, resp, next){

  logger.verbose(`req.method='${req.method}' req.path='${req.path}' req.ip='${req.ip}'`);
  logger.verbose(`req.body='${JSON.stringify(req.body)}'`);
  next();
}

function simpleFileRequestLogger(req, resp, next){

  logger.verbose(`req.method='${req.method}' req.path='${req.path}' req.ip='${req.ip}'`);
  let props = Object.getOwnPropertyNames(req.files);
  logger.verbose(`req.files='${props}'`);
  next();
}

//defaultRoutes.use(simpleRequestLogger);
//fileRoutes.use(simpleFileRequestLogger);
reactRoutes.use(simpleRequestLogger);
staticRoutes.use(simpleRequestLogger)

const publicFolder = process.cwd() + '/bin/public';
logger.verbose("test change")
staticRoutes.get('/', (req, res) => {
  res.sendFile( path.resolve(__dirname, '../static/index.html'))
});

staticRoutes.get('/js/*', (req, res) =>{
  logger.verbose("saw request for js file");
  res.sendFile( path.resolve(__dirname, '..' + req.path));
})
staticRoutes.get('//app/:appName/index.js', (req, res)=>{
  res.sendFile( path.resolve(__dirname, '..' + req.path));
})


reactRoutes.get('/app/:appName', (req, res)=>{
  var urlPath = `../app/${req.params.appName}/index.html`;
  var calculatorPath = path.resolve(__dirname, urlPath);
  logger.verbose("path to calculator is " + calculatorPath);
  res.sendFile(calculatorPath)
})

/*
fileRoutes.post("/api/fileanalyse", (req, res)=>{
  logger.verbose("inside /api/fileanalyse ");

  if(req.files.upfile){
    res.send({name: req.files.upfile.name, type: req.files.upfile.type, size: req.files.upfile.size})
  }

}); */

app.use(staticRoutes);
// app.use(defaultRoutes);
//app.use(fileRoutes);
app.use(reactRoutes);

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})



const listener = app.listen(process.env.PORT || 3000, () => {
  logger.info('Your app is listening on port ' + listener.address().port)
})
