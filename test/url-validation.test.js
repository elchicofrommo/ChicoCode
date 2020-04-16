const validateURL = require("./url-validation.js").validateURL;



test("Obtained the refernece to the function", ()=>{
	expect(validateURL).toBeTruthy();
});

test("testing invalid string url", (done)=>{

	validateURL("junk", (status, result)=>{
		try{
			expect(result).toBeFalsy();
			done();
		}catch(err){
			done(err)
		}
	});
		
});

test("testing invalid http://www.nowherethatisreal.com  url", (done)=>{

	validateURL("http://www.nowherethatisreal.com", (status, result)=>{
		try{
			expect(result).toBeFalsy();
			done();
		}catch(err){
			done(err)
		}
	});
		
});
/*
test("testing invalid int as url", (done)=>{
try{
	validateURL(1, (status, result)=>{
		try{
		//	expect(result).toBeFalsy();
			done();
		}catch(err){
			done(" couldn't make connection: " + err)
		}
	});
	}catch(err ){

		done("outer wrap couldn't make connectoin " + err)
	}	
});
*/
test("testing https://www.freecodecamp.org", (done) =>{


	function callback(status, result){
		try{

			expect(result).toBeTruthy();
			done();
		}catch(error){
			done(" a time out possibly? " + error);
		}
	}
	validateURL("https://www.freecodecamp.org", callback );
})

test("testing https://www.google.com", (done) =>{


	function callback(status, result){
		try{

			expect(result).toBeTruthy();
			done();
		}catch(error){
			done(" a time out possibly? " + error);
		}
	}
	validateURL("https://www.google.com", callback );
})

test("testing https://www.nytimes.com/section/world", (done) =>{


	function callback(status, result){
		try{

			expect(result).toBeTruthy();
			done();
		}catch(error){
			done(" a time out possibly? " + error);
		}
	}
	validateURL("https://www.nytimes.com/section/world", callback );
})

/*
test("can I make a promise out of this call back", async() => {
	let result;
	try{
		result = await new Promise((resolve, reject)=>{

			validateURL("https://www.nytimes.co",(err, result)=>{
				if(result)
					resolve(true);
				else
					reject(err)
			})
		})
		expect(result).toBeTruthy();
	}catch(err){
		expect(err).toBeFalsy();
	}

})*/

