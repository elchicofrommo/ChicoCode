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


test("Testing can get the UserModel object", ()=>{
	expect(UserModel).toBeTruthy();
});
