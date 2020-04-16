import Timestamp from './timestamp' 
import ShortUrl from './shorturl-dao'
import Header from './header'
import Fitness from './fitness'
import {logger} from '../utils/Logger';

var bodyParser = require('body-parser');
var express = require('express');
var apiRoutes = express.Router();
var fileUpload = require("express-fileupload");

apiRoutes.use(express.json()) // for parsing application/json
apiRoutes.use(bodyParser.urlencoded({ extended: false })) // for parsing application/x-www-form-urlencoded
apiRoutes.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

function bodyLogger(req, resp, next){
  logger.verbose(`req.body='${JSON.stringify(req.body)}'`);
  next();
}

apiRoutes.use(bodyLogger)

apiRoutes.get("/api/timestamp", function(req, res) {
  logger.verbose("getting timestamp with no timestmap ");
  res.send(Timestamp.getFormattedTimestamp());
});

apiRoutes.get("/api/timestamp/:timestamp", function(req, res) {
  logger.verbose("getting timestamp with  " + req.params.timestamp);
  res.send(Timestamp.getFormattedTimestamp(req.params.timestamp))
});


apiRoutes.post("/api/shorturl/new", function(req, res){

	if(!req.body && !req.body.url){
		res.send({error: "invalid URL"})
		return;
	}

	ShortUrl.getShortUrl(req.body.url).then((result)=>{
		setTimeout(()=>{res.send(result)}, 3000);
	})

})

apiRoutes.get("/api/shorturl/:short_url", function(req, res){
	let short_url = req.params.short_url;

	ShortUrl.findOriginalUrl(short_url).then( (result) => {

		logger.verbose("result is : " + JSON.stringify(result));
		if(result.original_url){
			logger.verbose("found original url: " + result)
			res.redirect(302, result.original_url);
		}
		else{
			logger.verbose("could not find original_url property " + result);
			res.send(result);
		}
		
	})
})

apiRoutes.get("/api/whoami", function (req, res){
	let parsedHeader = Header.parseHeader(req);
	logger.verbose(`The parsed header is ${JSON.stringify(parsedHeader)}`);
	res.send(parsedHeader);
});


apiRoutes.post('/api/exercise/new-user', (req, res)=>{

    logger.verbose("inside /api/exercise/new-user")
    let username = req.body.userId;
    Fitness.addUser(username).then((result)=>{
      logger.verbose("result from add is " + JSON.stringify(result))
      res.send(result);
    }).catch((err)=>{
      logger.verbose("caught an error creating user:  " + JSON.stringify(err))
      res.send(err)

    })

})


apiRoutes.post('/api/exercise/add', (req, res)=>{
  logger.verbose("inside /api/exercise/add with body:" +JSON.stringify(req.body));

    let exercise = {};
    exercise.user_id = req.body.userId;
    exercise.date = new Date(req.body.date);
    exercise.description = req.body.description;
    exercise.duration = req.body.duration;
    Fitness.addExercise(exercise).then((result)=>{
      res.send(result);
    }).catch((err)=>{
      logger.error(err)
      res.send(err)
    })
  }
)

apiRoutes.get('/api/exercise/log', (req, res)=>{
  logger.verbose("insdie /api/exercise/log params are " + JSON.stringify(req.query));
  try{
    let exercises = {};
    Fitness.getUserActivity(req.query.userId, req.query.from, req.query.to, req.query.limit).then((result)=>{
      logger.verbose("finished finding result is " + result);
      res.send(result);
    })
  }catch(err){
    res.send(err);
  }

})

apiRoutes.post("/api/fileanalyse", (req, res)=>{
  logger.verbose("inside file analyze ");
  logger.verbose(`req.method='${req.method}' req.path='${req.path}' req.ip='${req.ip}' req.files=${req.files}`);
  let props = Object.getOwnPropertyNames(req.files);
  logger.verbose(`req.files='${props}'`);
  
  if(req.files.upfile){
    res.send({name: req.files.upfile.name, type: req.files.upfile.type, size: req.files.upfile.size})
  }
});


export default apiRoutes