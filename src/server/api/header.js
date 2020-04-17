const Header ={}

Header.parseHeader = function (request){


	let toReturn = {};
	if(!request){
		toReturn.error= "No request object to parse";
		return toReturn;
	}
	if(!request.ip || !request.headers || !request.headers['accept-language'] || !request.headers['user-agent']){
		toReturn.error=  "Invalid Request Object, cannot parse";
		return toReturn 
	}

	toReturn.ipaddress = request.ip;

	let temp = request.headers['accept-language'];
	toReturn.language = temp;

	temp = request.headers['user-agent'];
	toReturn.software = temp;

	return toReturn;
}

export default Header