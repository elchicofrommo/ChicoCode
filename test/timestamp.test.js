const getFormattedTimestamp = require('./timestamp.js').getFormattedTimestamp;

test('validating function exists', () =>{
	expect(getFormattedTimestamp).toBeTruthy();
});

test("no arg should return current timestamp", ()=>{
	var currentTime = getFormattedTimestamp();
	expect(currentTime).toBeTruthy();
	validateFormat(currentTime);
});

const invalid = {
	unix: null,
	utc: 'Invalid Date'
}

test(`bad arg should return ${JSON.stringify(invalid)}`, () =>{
	var time = getFormattedTimestamp("xxx");
	expect(time).toBeTruthy();
	expect(time).toEqual(invalid);


})

test(`Verify ISO-8601 compliant date strings create valid date`, ()=>{
	var time = getFormattedTimestamp("2016-11-20");
	validateFormat(time);

	time = getFormattedTimestamp("October 13, 2014 11:13:00");
	validateFormat(time);
});

test("verify number does create a date", ()=>{
	var time = getFormattedTimestamp(1450137600);
	validateFormat(time);

	time = getFormattedTimestamp(1);
	validateFormat(time);
})

test("verify number as a string does create a date", ()=>{
	var time = getFormattedTimestamp("1450137600");
	validateFormat(time);

	time = getFormattedTimestamp("1");
	validateFormat(time);
})

function validateFormat(time){
	expect(time).toHaveProperty("unix");
	expect(time).toHaveProperty("utc");
	expect(time.unix).toBeGreaterThan(0);
	expect(time.utc).toEqual(expect.stringMatching(/\w/));
}