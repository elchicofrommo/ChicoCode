const Timestamp = {};

Timestamp.getFormattedTimestamp = function(timestamp){

	let toReturn = null;
	let date = null;
	if(!timestamp){
		date = new Date();
	}else if(!isNaN(timestamp)){
		date = new Date(parseInt(timestamp))
	}else{
		date = new Date(timestamp);
	}
	if(date.toString() != "Invalid Date"){
		toReturn = {
			unix: date.getTime(), 
			utc: date.toUTCString()
		}
	}else{
		toReturn = {
			unix: null, 
			utc: "Invalid Date"
		}
	}
	return toReturn;
}

export default Timestamp;