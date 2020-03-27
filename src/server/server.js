'use strict';

import path from 'path';
import logger from './utils/Logger';
import UserModel from './UserModel';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';
import webpackConfig from '../../webpack.config.js'
import styleConfig from '../../webpack.config.style.js'

//import React from 'react';
//import { renderToString } from 'react-dom/server';
//const TestApp = require( '../test/testrun.js')


const dotenv = require('dotenv');
const result = dotenv.config();
if (result.error) {
  throw result.error;
}
const { parsed: envs } = result;

console.log("webpack.config.js envs are " + JSON.stringify(envs))

const nodeEnv = envs.NODE_ENV;
const isDevelopment = nodeEnv == 'development';

logger.info(`Starting chico_express in ${nodeEnv} mode... `);


var express = require('express');
//var fileRoutes = express.Router();
//var defaultRoutes = express.Router();
var defaultRoutes = express.Router();
var reactRoutes = express.Router();


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
if(isDevelopment){
  

  logger.info("starting up a development server, loading webpack details: ");

  webpackConfig.watch = true;
  const clientCompiler = webpack([webpackConfig,styleConfig]);


  const clientMiddleware = webpackDevMiddleware(clientCompiler, {writeToDisk: true});
  const serverMiddleware = webpackHotMiddleware(clientCompiler, {writeToDisk: true});

  app.use(clientMiddleware);
  app.use(serverMiddleware)

}



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
defaultRoutes.use(simpleRequestLogger)

const publicFolder = process.cwd() + '/bin/public';
logger.verbose("test change")
defaultRoutes.get('/', (req, res) => {
  res.sendFile( path.resolve(__dirname, '../static/index.html'))
});

defaultRoutes.get('/view/:pageName', (req, res)=>{
  res.sendFile(path.resolve(__dirname, '../static/' + req.params.pageName + ".html"))
})

defaultRoutes.get('/js/*', (req, res) =>{
  logger.verbose("saw request for js file");
  res.sendFile( path.resolve(__dirname, '..' + req.path));
})

defaultRoutes.get('/view/*.html', (req, res) => {
  let myPath = req.path.replace("view", "static");
  res.sendFile(path.resolve(__dirname, '..' + myPath))
})

defaultRoutes.get('/assets/*', (req, res)=> {
  logger.verbose("saw request for asset file");
  res.sendFile( path.resolve(__dirname, '..' + req.path))
})

defaultRoutes.get('/style/*', (req, res)=> {
  logger.verbose("saw request for style sheet");
  res.sendFile( path.resolve(__dirname, '..' + req.path))
})

/*defaultRoutes.get('/testApp', (req, res) => {
  logger.verbose("saw request for test app");
  const appString = renderToString(<TestApp />);
  logger.verbose("the rendered string is : " + appString);
  res.send(appString);
})*/


reactRoutes.get('/app/:appName', (req, res)=>{
  var urlPath = `../app/${req.params.appName}/index.html`;
  var calculatorPath = path.resolve(__dirname, urlPath);
  logger.verbose("path to calculator is " + calculatorPath);
  res.sendFile(calculatorPath)
})
reactRoutes.get('/app/:appName/*', (req, res)=>{
  logger.verbose("request for supporting app files for " + req.params.appName)
  res.sendFile( path.resolve(__dirname, '..' + req.path));
})
reactRoutes.get('/app/*.json', (req, res)=>{
  logger.verbose("request for hot update " + req.params.appName)
  res.sendFile( path.resolve(__dirname, '..' + req.path));
})


/*
fileRoutes.post("/api/fileanalyse", (req, res)=>{
  logger.verbose("inside /api/fileanalyse ");

  if(req.files.upfile){
    res.send({name: req.files.upfile.name, type: req.files.upfile.type, size: req.files.upfile.size})
  }

}); */

app.use(defaultRoutes);
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
