const getNextSequence = require("./shorturl-dao.js").getNextSequence;
const getCurrentSequenceValue = require("./shorturl-dao.js").getCurrentSequenceValue;
const insertInitialSequence = require("./shorturl-dao.js").insertInitialSequence;
const createShortUrl = require("./shorturl-dao.js").createShortUrl;
const findShortUrl = require("./shorturl-dao.js").findShortUrl;
const getShortUrl = require('./shorturl-dao.js').getShortUrl;
const findOriginalUrl = require('./shorturl-dao.js').findOriginalUrl;


const MongodbMemoryServer = require('mongodb-memory-server')
const mongoServer = new MongodbMemoryServer.MongoMemoryServer()


const mongoose = require('mongoose');

beforeAll(async()=> {
	global.__MONGO_URI__ = await mongoServer.getConnectionString()
	console.log(`global uri is ${global.__MONGO_URI__}`)
    await mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });


   	try{
   		let val = await insertInitialSequence();
   		console.log("inserted initial val " + val);
   	}catch(err){
   		expect(err).toBeFalsy();
   		console.log("Failed to insert initial val shoudl quit test");
   	}


   	return;

})

test("Obtained the refernece to the function", ()=>{
	expect(getNextSequence).toBeTruthy();
});


test("test getNextSequence increments correctly", async() =>{

	var seq;
	try{
		seq = await getNextSequence();
		expect(seq.sequence_value).toEqual(2);
		seq = await getNextSequence();
		expect(seq.sequence_value).toEqual(3);
		seq = await getNextSequence();
		expect(seq.sequence_value).toEqual(4);
	
	}catch(err){
		expect(err).toBeFalsy();
	}

	return;

})

test("Testing the creation of short urls", async()=>{
	var shortUrl;
	try{
		shortUrl = await createShortUrl("http://www.google.com");
		expect(shortUrl).toBeTruthy();
		expect(shortUrl).toHaveProperty("original_url");
		expect(shortUrl).toHaveProperty("short_url");
		expect(shortUrl.original_url).toEqual("http://www.google.com");
		expect(shortUrl.short_url).toEqual(5);

		shortUrl = await createShortUrl("http://www.nytimes.com");
		expect(shortUrl).toBeTruthy();
		expect(shortUrl).toHaveProperty("original_url");
		expect(shortUrl).toHaveProperty("short_url");
		expect(shortUrl.original_url).toEqual("http://www.nytimes.com");
		expect(shortUrl.short_url).toEqual(6);


	}catch(err){
		expect(err).toBeFalsy();
	}
})

test("Teseting the finding of short urls that were just created", async()=>{
	try{
		var shortUrl = await findShortUrl("http://www.google.com");
		expect(shortUrl).toBeTruthy();
		expect(shortUrl).toHaveProperty("original_url");
		expect(shortUrl).toHaveProperty("short_url");
		expect(shortUrl).toHaveProperty('_id');
		expect(shortUrl.original_url).toEqual("http://www.google.com");
		expect(shortUrl.short_url).toEqual(5);

		shortUrl = await findShortUrl("http://www.nytimes.com");
		expect(shortUrl).toBeTruthy();
		expect(shortUrl).toHaveProperty("original_url");
		expect(shortUrl).toHaveProperty("short_url");
		expect(shortUrl).toHaveProperty('_id');
		expect(shortUrl.original_url).toEqual("http://www.nytimes.com");
		expect(shortUrl.short_url).toEqual(6);
	}catch(err){
		expect(err).toBeFalsy();
	}
})

test("getShortUrl for existing entries should return those entries and not new ones", async()=>{
	try{
		var shortUrl = await getShortUrl("http://www.google.com");
		expect(shortUrl).toBeTruthy();
		expect(shortUrl.short_url).toEqual(5);

		var shortUrl = await getShortUrl("http://www.nytimes.com");
		expect(shortUrl).toBeTruthy();
		expect(shortUrl.short_url).toEqual(6);

	}catch(err){
		expect(err).toBeFalsy();
	}
});

test("getShortUrl for a new valid url", async()=>{
	try{
		var shortUrl = await getShortUrl("https://www.freecodecamp.org");
		expect(shortUrl).toBeTruthy();
		expect(shortUrl.short_url).toEqual(7);


	}catch(err){
		expect(err).toBeFalsy();
	}
});



test('testing bad input xxx into getShortUrl', async()=> {
	try{
		var shortUrl = await getShortUrl("xxx");
		expect(shortUrl).toEqual({error: "invalid url"});


	}catch(err){
		expect(err).toBeFalsy();
	}
})

test('testing bad input http://www.nowherethatisreal.com into getShortUrl', async()=> {
	try{
		var shortUrl = await getShortUrl("http://www.nowherethatisreal.com");
		expect(shortUrl).toEqual({error: "invalid url"});


	}catch(err){
		expect(err).toBeFalsy();
	}
})

test("finding original urls by already created short_url", async() => {
	try{
		var originalUrl = await findOriginalUrl(5);
		console.log("finding by short id: " + originalUrl);
		expect(originalUrl).toHaveProperty("original_url");
		expect(originalUrl.original_url).toEqual("http://www.google.com");
		originalUrl = await findOriginalUrl(6);
		expect(originalUrl).toHaveProperty("original_url");
		console.log("finding by short id: " + originalUrl);
		expect(originalUrl.original_url).toEqual("http://www.nytimes.com");
		originalUrl = await findOriginalUrl(7);
		expect(originalUrl).toHaveProperty("original_url");
		console.log("finding by short id: " + originalUrl);
		expect(originalUrl.original_url).toEqual("https://www.freecodecamp.org");
	}catch(err){
		expect(err).toBeFalsy();
	}
})

test("searching for origianl url by a short that doesn't exist", async()=>{
	try{
		var error = await findOriginalUrl(99);
		expect(error).toEqual({"error":"No short url found for given input"});

		error = await findOriginalUrl(101);
		expect(error).toEqual({"error":"No short url found for given input"});
	}catch(err){
		console.log("test error " + err)
		expect(err).toBeFalsy()
	}
})

/*
test("insertIntoSequence", done => {
	insertIntoSequence((err, data)=>{
		console.log(`done inserting, resutls are ${err} ${data}`)
		try{
			expect(data).toBeTruthy();
			done();
		}catch(err){
			done(err)
		}
	});
})

*/
afterAll(async()=>{
	console.log("closing up shop");
	await mongoose.connection.close();
	await mongoServer.stop();
	console.log("closed");
});
