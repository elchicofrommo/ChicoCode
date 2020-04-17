

const dns = require('dns');


function validateURL(url, done){

	let myUrl;
	if(url && typeof url == "string"){
		myUrl = url.toLowerCase();
		if(url.startsWith("https")){
			myUrl = url.substring(8);
		}else{
			myUrl = url.substring(7);
		}
		myUrl = myUrl.split('/')[0];
	}

	if(myUrl==""){
		done(null, false);
		return;
	}
	try{
		console.log("step 1 " + myUrl);
		dns.lookup(myUrl, (err, address, family)=> {
			console.log("step 2");


			let bReturn = true;
			if(err){
				bReturn = false;
				console.log("found a problem with the url " + err);
			}
			done(err, bReturn);

		})
		console.log("step 3");
	}catch(err){
		console.log("caught exceptoin in url validation " + err);
		done(err, false)
	}
}

exports.validateURL = validateURL;