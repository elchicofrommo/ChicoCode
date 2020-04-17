import logger from '../src/utils/Logger'
import UserModel from '../src/UserModel'

const MongodbMemoryServer = require('mongodb-memory-server')
const mongoServer = new MongodbMemoryServer.MongoMemoryServer()


const mongoose = require('mongoose');

beforeAll(async()=> {
	global.__MONGO_URI__ = await mongoServer.getConnectionString()
	logger.info(`global uri is ${global.__MONGO_URI__}`)
    await mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
        if (err) {
            logger.error(err);
            process.exit(1);
        }
    });

   	return;

})


test("Testing can get the UserModel object", (done)=>{
	expect(UserModel).toBeTruthy();
	done();
});

test("Testing creation of new user obecjts", async(done)=> {
	let user1 = UserModel.add("chicouser");
	let user2 = UserModel.add("super_duper");

	let result = await Promise.all([user1, user2]);
	user1 = result[0];
	user2 = result[1];
	logger.info("result: " + JSON.stringify(result));
	logger.info("user1 " + JSON.stringify(user1));
	expect(user1).toBeTruthy();
	expect(user1).toHaveProperty("user_name");
	expect(user1).toHaveProperty("_id");
	expect(user1.user_name).toEqual("chicouser");


	logger.info("user2 " + JSON.stringify(user2));
	expect(user2).toBeTruthy();
	expect(user2).toHaveProperty("user_name");
	expect(user2).toHaveProperty("_id");
	expect(user2.user_name).toEqual("super_duper");
	done();
})

test("Test finding user created in last test", async(done)=>{
	let user1 = UserModel.findByUserName("chicouser");
	let user2 = UserModel.findByUserName("super_duper");

	let result = await Promise.all([user1, user2]);
	user1 = result[0];
	user2 = result[1];

	expect(user1).toBeTruthy();
	expect(user1).toHaveProperty("user_name");
	expect(user1).toHaveProperty("_id");
	expect(user1.user_name).toEqual("chicouser");

	expect(user2).toBeTruthy();
	expect(user2).toHaveProperty("user_name");
	expect(user2).toHaveProperty("_id");
	expect(user2.user_name).toEqual("super_duper");
	done();
})

test("Test finding a user that doesn't exist", async(done)=>{
	let user = await UserModel.findByUserName("iamnotreal");
	logger.info("result " + JSON.stringify(user));
	done();
})

test("making sure you can't create the same user name twice ", async()=>{
	let user1 = await UserModel.add("username");
	let user2 = await UserModel.add("username");

	expect(user2.code).toEqual(11000);
	logger.info("double user name user name " + user2);
})

afterAll(async()=>{
	logger.info("closing up shop");
	let close = mongoose.connection.close();
	let stop = mongoServer.stop();
	await Promise.all([close, stop]);
	
	logger.info("closed");
});
