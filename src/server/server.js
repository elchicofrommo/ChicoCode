'use strict';

import path from 'path';
import {Logger as logger} from './utils/Logger';

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';
import webpackConfig from '../../webpack.config.js'
import styleConfig from '../../webpack.config.style.js'
import apiRoutes from './api/router.js'

var cors = require('cors');
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

var serverless = require('serverless-http')
var express = require('express');
var defaultRoute = express.Router();
var staticRoutes = express.Router();
var mongo = require('mongodb');
var mongoose = require('mongoose');


var app = express();
app.use(cors())

function requestLogger(req, resp, next){

  logger.verbose(`req.method='${req.method}' req.path='${req.path}' req.ip='${req.ip}'`);
  next();
}

app.use(requestLogger)

if(isDevelopment){
  

  logger.info("starting up a development server, loading webpack details: ");

  webpackConfig.watch = true;
  const clientCompiler = webpack([webpackConfig,styleConfig]);

  const devServerMiddleware = webpackDevMiddleware(clientCompiler, {publicPath: '/bin/'});
  const hotReplaceMiddleware = webpackHotMiddleware(clientCompiler);

  app.use(devServerMiddleware);
  app.use(hotReplaceMiddleware)

}else{

  defaultRoute.get('/', (req, res) => {
    res.sendFile( path.resolve(__dirname, '../index.html'))
  });


  staticRoutes.get('/*', (req, res)=>{
    res.sendFile(path.resolve(__dirname, ".." + req.path))
  })


  app.use(defaultRoute);
  app.use(staticRoutes);
}


logger.info(`Connecting DB to ${process.env.DATABASE_URI}` )
mongoose.connect(process.env.DATABASE_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}); 

app.use(apiRoutes);

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

export const handler = serverless(app);
