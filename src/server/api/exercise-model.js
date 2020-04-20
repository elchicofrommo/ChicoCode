import {Logger as logger} from '../utils/Logger';
import UserModel from './user-model';

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

var Schema = mongoose.Schema;
var ObjectId = require('mongoose').Types.ObjectId;





var ExerciseSchema =  new Schema ({
	user_id: {
		type: String, 
		ref: 'User', 
		id: '_id'
	}, 
	description: {
		type: String, 
		required: true
	},
	duration: {
		type: Number,
		required: true
	},
	date: {
		type: Date
	},

});

var ExerciseModel = mongoose.model('Excercise', ExerciseSchema, 'fitness_exercise');

ExerciseModel.add = async function(exerciseEntry){
	let exercise = undefined;
	

	try{

		logger.verbose("Adding new exerciseEntry " + JSON.stringify(exerciseEntry));
		exercise = new ExerciseModel(exerciseEntry);

		exercise = await exercise.save();

		logger.verbose("result is " + JSON.stringify(exercise));


		return exercise;
	}catch(err){
		logger.error(`Could not create excercise becasue of ${err}`);
		throw {error: err.toString()};
	}
}

ExerciseModel.findByUserId = async function(user_id, fromArg, toArg, limit){
	let  exercises = undefined;
	try{
		logger.verbose("finding exercises for user_id " + user_id);
		let query = {user_id: user_id};


		if(fromArg || toArg){
			query.date = {};
		}

		if(fromArg){
			logger.verbose("adding query fromArg");
			query.date['$gte'] = fromArg;
		}

		if(toArg){
			logger.verbose("adding query toArg");
			query.date['$lte'] = toArg;
		}

		query = ExerciseModel.find(query);
		if(limit){
			query.limit(parseInt(limit));
		}
		exercises = await query.exec();
		logger.verbose("result is : " + JSON.stringify(exercises));
		return exercises;
	}catch(err){
		logger.error('Could not find exercises because ' + err);
		return {error: err.toString()}
	}
}



export default ExerciseModel