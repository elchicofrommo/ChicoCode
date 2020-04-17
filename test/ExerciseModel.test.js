var sfy = JSON.stringify;
import ExerciseModel from '../src/ExerciseModel';
import logger from '../src/utils/Logger'
import UserModel from '../src/UserModel'
import shortid from 'shortid';

const MongodbMemoryServer = require('mongodb-memory-server')
const mongoServer = new MongodbMemoryServer.MongoMemoryServer()


const mongoose = require('mongoose');
let users = []
let testNum = 1;
beforeAll(async()=> {
	global.__MONGO_URI__ = await mongoServer.getConnectionString()
	logger.info(`global uri is ${global.__MONGO_URI__}`)
    await mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
        if (err) {
            logger.error(err);
            process.exit(1);
        }
    });

    logger.info('beforeAll: creating default users')
	users.push(UserModel.add("test_user_1"));
	users.push(UserModel.add("test_user_2"));
	users.push(UserModel.add("test_user_3"));

	users = await Promise.all(users);
	logger.info("beforeAll: created the following: " + sfy(users));

   	return;

})


function createBaseExercise(user_id){
	return {
		user_id: (user_id)? user_id: shortid.generate(),
		description: "test description " + shortid.generate(),
		date: new Date(),
		duration: 10
	}
}

{
let testString = `EM${testNum++} `;	
test(`${testString}} Creating exercise with no corresponding user should fail`, async()=>{

	let exercise = createBaseExercise();
	logger.info(testString +"no user for this: " + JSON.stringify(exercise));
	let fail1 = ExerciseModel.add(exercise);

	exercise = createBaseExercise();
	logger.info(testString + "no user for this: " + JSON.stringify(exercise));
	let fail2 = ExerciseModel.add(exercise)

	exercise = createBaseExercise();
	logger.info(testString + "no user for this: " + JSON.stringify(exercise));
	let fail3 = ExerciseModel.add(exercise)

	const result = await Promise.all([fail1, fail2, fail3])
	logger.info(testString + "results from all 3 are: " + JSON.stringify(result));

	let failure = /ValidationError: user_id: Cast to ObjectID \w+/;
	expect(result[0].error).toMatch(failure);
	expect(result[1].error).toMatch(failure);
	expect(result[2].error).toMatch(failure);

	
})}

{
let testString = `EM${testNum++} `;
test(`${testString} creating exercises wiht a backing user`, async()=>{
	

	let exercises = [];


	exercises.push(ExerciseModel.add(createBaseExercise(users[0]._id)));
	exercises.push(ExerciseModel.add(createBaseExercise(users[0]._id)));
	exercises.push(ExerciseModel.add(createBaseExercise(users[1]._id)));
	exercises.push(ExerciseModel.add(createBaseExercise(users[2]._id)));
	exercises.push(ExerciseModel.add(createBaseExercise(users[1]._id)));
	exercises.push(ExerciseModel.add(createBaseExercise(users[1]._id)));
	exercises.push(ExerciseModel.add(createBaseExercise(users[0]._id)));

	exercises = await Promise.all(exercises);

	logger.info(testString + "exercises are the following " + sfy(exercises));
	expect(exercises[0].user_id).toEqual(users[0]._id);
	expect(exercises[1].user_id).toEqual(users[0]._id);
	expect(exercises[2].user_id).toEqual(users[1]._id);
	expect(exercises[3].user_id).toEqual(users[2]._id);
	expect(exercises[4].user_id).toEqual(users[1]._id);
	expect(exercises[5].user_id).toEqual(users[1]._id);
	expect(exercises[6].user_id).toEqual(users[0]._id);

	expect(exercises[0].date.getTime()).toBeLessThan(exercises[1].date.getTime());
	expect(exercises[1].date.getTime()).toBeLessThan(exercises[2].date.getTime());
	expect(exercises[2].date.getTime()).toBeLessThan(exercises[3].date.getTime());
	expect(exercises[3].date.getTime()).toBeLessThan(exercises[4].date.getTime());
	expect(exercises[4].date.getTime()).toBeLessThan(exercises[5].date.getTime());

	expect(exercises[5].date.getTime()).toBeLessThan(exercises[6].date.getTime());



})}

{
let testString = `EM${testNum++} `;
test(`${testString} finding exercises where user has entries`, async()=>{
	let exercises = {};
	logger.info("looking for user " + users[0]._id )
	exercises = await ExerciseModel.findByUserId(users[0]._id);
	logger.info(`found for user ${users[0]._id} ${exercises}`)
	expect(exercises.length).toEqual(3);

	logger.info("looking for user " + users[1]._id )
	exercises = await ExerciseModel.findByUserId(users[1]._id);
	logger.info(`found for user ${users[1]._id} ${exercises}`)
	expect(exercises.length).toEqual(3);

	logger.info("looking for user " + users[2]._id )
	exercises = await ExerciseModel.findByUserId(users[2]._id);
	logger.info(`found for user ${users[2]._id} ${exercises}`)
	expect(exercises.length).toEqual(1);
})}

{
let testString = `EM${testNum++} `;
test(`${testString} finding exercises where there is no use`, async()=>{
	let exercises = {};
	logger.info(testString+ "looking for user 12345");
	exercises = await ExerciseModel.findByUserId("12345");
	logger.info(`${testString}found for user 12345 ${exercises}`)
	expect(exercises.length).toEqual(0);


})}

{
let testString = `EM${testNum++} `;
test(`${testString} finding exercises and limiting output`, async()=>{
	let exercises = {};
	logger.info(`${testString} looking for exercises for ${users[0]._id}, 3 have been created, one should be returned`);
	exercises = await ExerciseModel.findByUserId(users[0]._id, undefined, undefined, 1);
	expect(exercises.length).toEqual(1);

	logger.info(`${testString} looking for exercises for ${users[0]._id}, 3 have been created, two should be returned`);
	exercises = await ExerciseModel.findByUserId(users[0]._id, undefined, undefined, 2);
	expect(exercises.length).toEqual(2);

	logger.info(`${testString} looking for exercises for ${users[0]._id}, 3 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[0]._id, undefined, undefined, 3);
	expect(exercises.length).toEqual(3);

})}

{
let testString = `EM${testNum++} `;
test(`${testString} testing from with dates way in the past should return items`, async()=>{
	let exercises = {};
	logger.info(`${testString} looking for exercises for ${users[0]._id}, 3 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[0]._id, "2020-01-01", undefined);
	expect(exercises.length).toEqual(3);

	logger.info(`${testString} looking for exercises for ${users[1]._id}, 3 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[1]._id, "2020-01-01", undefined);
	expect(exercises.length).toEqual(3);

	logger.info(`${testString} looking for exercises for ${users[2]._id}, 2 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[2]._id, "2020-01-01", undefined);
	expect(exercises.length).toEqual(1);


})}

{
let testString = `EM${testNum++} `;
test(`${testString} testing from with a future date should return nothing`, async()=>{
	let exercises = {};
	logger.info(`${testString} looking for exercises for ${users[0]._id}, 3 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[0]._id, "2099-01-01", undefined);
	expect(exercises.length).toEqual(0);

	logger.info(`${testString} looking for exercises for ${users[1]._id}, 3 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[1]._id, "2099-01-01", undefined);
	expect(exercises.length).toEqual(0);

	logger.info(`${testString} looking for exercises for ${users[2]._id}, 2 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[2]._id, "2099-01-01", undefined);
	expect(exercises.length).toEqual(0);


})}

{
let testString = `EM${testNum++} `;
test(`${testString} testing to with a future date should return everything`, async()=>{
	let exercises = {};
	logger.info(`${testString} looking for exercises for ${users[0]._id}, 3 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[0]._id, undefined, "2099-01-01");
	expect(exercises.length).toEqual(3);

	logger.info(`${testString} looking for exercises for ${users[1]._id}, 3 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[1]._id, undefined, "2099-01-01");
	expect(exercises.length).toEqual(3);

	logger.info(`${testString} looking for exercises for ${users[2]._id}, 2 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[2]._id, undefined, "2099-01-01");
	expect(exercises.length).toEqual(1);


})}

{
let testString = `EM${testNum++} `;
test(`${testString} testing to with a past date should return nothing`, async()=>{
	let exercises = {};
	logger.info(`${testString} looking for exercises for ${users[0]._id}, 3 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[0]._id, undefined, "2001-01-01");
	expect(exercises.length).toEqual(0);

	logger.info(`${testString} looking for exercises for ${users[1]._id}, 3 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[1]._id, undefined, "2001-01-01");
	expect(exercises.length).toEqual(0);

	logger.info(`${testString} looking for exercises for ${users[2]._id}, 2 have been created, three should be returned`);
	exercises = await ExerciseModel.findByUserId(users[2]._id, undefined, "2001-01-01");
	expect(exercises.length).toEqual(0);


})}



afterAll(async()=>{
	logger.info("closing up shop");
	let close = mongoose.connection.close();
	let stop = mongoServer.stop();
	await Promise.all([close, stop]);
	
	logger.info("closed");
});


