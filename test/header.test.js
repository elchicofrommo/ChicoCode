const parseHeader = require('./header.js').parseHeader;

test("Entering into tests for header.js", ()=>{
	expect(true).toEqual(true);
});

let emptyRequest = null;
let allMissing = {
	somethingElse: ""
}
let onlyIp = {
	ip: "1.1.1.1"
}
let onlyLanguage = {
	headers: {'accept-language': "english 101"}
}
let onlyUserAgent = {
	headers: {'user-agent': "chico server tests"}
}

test("Empty Request Object", ()=>{
	let parsed = parseHeader(emptyRequest);
	expect(parsed).toEqual({error: "No request object to parse"})
})

test("Test request without any fields", ()=>{
	let parsed = parseHeader(allMissing)
	expect(parsed).toEqual({error: "Invalid Request Object, cannot parse"});
})

test("test request with only one ip", () =>{
	let parsed = parseHeader(onlyIp);
	expect(parsed).toEqual({error: "Invalid Request Object, cannot parse"});
})
test("test request with only language", () =>{
	let parsed = parseHeader(onlyLanguage);
	expect(parsed).toEqual({error: "Invalid Request Object, cannot parse"});
})
test("test request with only User Agent", () =>{
	let parsed = parseHeader(onlyUserAgent);
	expect(parsed).toEqual({error: "Invalid Request Object, cannot parse"});
})
test("test request with valid rquest", () =>{

	let composed = {};
	composed = Object.assign(composed, onlyIp, onlyLanguage);
	composed.headers = Object.assign(composed.headers, onlyUserAgent.headers);
	console.log(JSON.stringify(composed));
	let parsed = parseHeader(composed);
	validateAllPropertiesPresent(parsed);
})

function validateAllPropertiesPresent(parsed){
	expect(parsed).toHaveProperty('ipaddress');
	expect(parsed).toHaveProperty('language');
	expect(parsed).toHaveProperty('software');
}