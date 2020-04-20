var chalk = require('chalk');

var winston = require('winston');

var winstonLogger = winston.createLogger({
  level: 'verbose',
  //format: winston.format.json(),
  //defaultMeta: { service: 'user-service' },
  format: winston.format.simple(),
  transports: [

    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});

var expressMiddlewareLogger = function (req, res, next) {
  winstonLogger.info(req)
  next()
}
 
let fmt_class = chalk.green
let fmt_info = chalk.cyan
let fmt_error = chalk.bold.red
let fmt_warning = chalk.yellow
let fmt_verbose = chalk.magenta
let verbose = false
let rootDir = 'hit_counter_app/'

export const Logger = {};


Logger.info = function(output){
		

	if(verbose)
		output = output + this.getCallSource()

	var time = (new Date()).toUTCString();
	output = `[${time}] ` + output;
	// now log async so it doesn't hold up thread execution
	//this.logAsync(fmt_info(output))
	winstonLogger.info( fmt_info(output))
	//winstonLogger.info( output)
}

Logger.error = function(output){
	if(verbose)
		output = output + this.getCallSource()

	var time = (new Date()).toUTCString();
	output = `[${time}] ` + output;

	//winstonLogger.error(output )
	winstonLogger.error(fmt_error(output ))
	//winston.error(fmt_error(output))
}

Logger.warning = function(output){
	if(verbose)
		output = output + this.getCallSource()

	var time = (new Date()).toUTCString();
	output = `[${time}] ` + output;
	//winstonLogger.warn(output)
	winstonLogger.warn(fmt_warning(output))
}
Logger.verbose = function(output){
	if(verbose)
		output = output + this.getCallSource()

	var time = (new Date()).toUTCString();
	output = `[${time}] ` + output;
	//winstonLogger.verbose(output)
	winstonLogger.verbose(fmt_verbose(output))
}

Logger.logAsync = function(output){
	 var p = new Promise(function(resolve, reject) {
    	// Do async job
        console.log(output)
        resolve("logged")
	})

	
}

Logger.getExpressLogger = function(){


	return expressMiddlewareLogger
}
	
Logger.getCallSource = function() {
  // this does not work on all javascript engines. Its very hacky and
  // should never be done on a productoin level ... something like this 
  // might work but would need more tightening like tightening the app locaiton
  var orig = new Error().stack;
  var stack = orig.split('\n');
  var fileLocation = stack[3].substring(rootDir)
  
  return fmt_verbose( fileLocation) 

}	

Logger.info("ready to export Logger");




