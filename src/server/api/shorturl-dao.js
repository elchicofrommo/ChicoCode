import {Logger as logger} from '../utils/Logger';
import {validateURL} from './url-validation'
var sfy = JSON.stringify;
var mongo = require('mongodb');
var mongoose = require('mongoose');

const DATABASE_URI="mongodb+srv://elchicofrommo:N3wst@rt@cluster0-yci70.mongodb.net/fcc_work_2?retryWrites=true&w=majority"

logger.info(`Connecting DB to ${DATABASE_URI}` )
mongoose.connect(DATABASE_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true ,
  useCreateIndex: true
}); 


const ShortUrlDao =  {};

var Schema = mongoose.Schema;

var SequenceSchema = new Schema ({
	sequence_value: Number, 
	type: String
});
var Sequence = mongoose.model('Sequence', SequenceSchema, 'sequence');

var ShortURLSchema = new Schema({
  original_url: String,
  short_url: Number
  
})

var ShortURL = mongoose.model("ShortURL", ShortURLSchema, 'short_url')

ShortUrlDao.getCurrentSequenceValue = function(done){

	Sequence.findOne({type: "short_key"}, function(err, data){
	    if(err){

	      done(err);
	    }
	    else{

	      done(null, data);
	    }
  });
}

ShortUrlDao.insertInitialSequence = function(){
	var sequence = new Sequence({type: 'short_key', sequence_value: 1});
	return sequence.save();

}

ShortUrlDao.getNextSequence = function(){
	return Sequence.findOneAndUpdate(
		{type: "short_key"}, 
		{$inc: {sequence_value: 1}}, 
		{new:true});
}





ShortUrlDao.createShortUrl = async function(url){
	var seq = await ShortUrlDao.getNextSequence();
	var short = new ShortURL({original_url: url, short_url: seq.sequence_value});
	return short.save();
}

ShortUrlDao.findShortUrl = async function(url){
	let toReturn = undefined;
	try{
		toReturn = await ShortURL.findOne({original_url: url}).select('original_url short_url -_id');
		logger.verbose("found: " + toReturn);
	}catch(err){
		logger.verbose('failed to find short url for ' + url + " due to " + err);
	}
	logger.verbose("findShortUrl returning " + toReturn);
	return  toReturn
}

ShortUrlDao.findOriginalUrl = async function(short_url){
	try{
		let toReturn = await ShortURL.findOne({short_url: short_url}).select('original_url -_id');
		if(!toReturn)
			toReturn = {"error":"No short url found for given input"};
		return toReturn;
	}catch(err){
		logger.verbose('failed to find original url for short_url ' + short_url);
		return {"error":"No short url found for given input"};
	}
}

ShortUrlDao.getShortUrl = async function(url){

	// first see if the url exists

	var short = await ShortUrlDao.findShortUrl(url);

	if(short){
		logger.verbose("found something for shor url " + url + " value is " + short);
		return short;
	}

	let valid;
	try{
		valid = await new Promise((resolve, reject)=>{

			validateURL(url,(err, result)=>{
				if(result)
					resolve(true);
				else
					reject(err)
			})
		})

	}catch(err){
		valid = false;
		logger.verbose("url is invalid : " + err);
	}


	let result;
	if(valid){
		logger.verbose(url + " is valid, now creating short url")
		try{
			result = await ShortUrlDao.createShortUrl(url);
		}catch(err){
			result = {error: "unknown error " + err};
		}
	}else{
		result = {error: "invalid url"};
	}
	return result;
}

export default ShortUrlDao;
