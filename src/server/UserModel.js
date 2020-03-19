var sfy = JSON.stringify;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

import logger from './utils/Logger';


var UserSchema =  new Schema ({
	user_name: String,
	user_id: Number
});

var UserModel = mongoose.model('User', UserSchema, 'fitness_user');

UserModel.findUser  = async function(userName){

	let toReturn = undefined;
	try{
		toReturn = await User.findOne({user_name: userName}).select('user_name user_id -_id');
		logger.info("found: " + toReturn);
	}catch(err){
		logger.error('failed to find short url for ' + url + " due to " + err);
	}
	logger.info("findShortUrl returning " + toReturn);
	return  toReturn
}

export default UserModel