import {Logger as logger} from '../utils/Logger';

const dns = require('dns');


export function validateURL(url, done){

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
		logger.verbose("step 1 " + myUrl);
		dns.lookup(myUrl, (err, address, family)=> {
			logger.verbose("step 2");


			let bReturn = true;
			if(err){
				bReturn = false;
				logger.verbose("found a problem with the url " + err);
			}
			done(err, bReturn);

		})
		logger.verbose("step 3");
	}catch(err){
		logger.verbose("caught exceptoin in url validation " + err);
		done(err, false)
	}
}
