var assert, getConnectionInfo;

assert = require('assert');

getConnectionInfo = require('../').getConnectionInfo;

describe('getConnectionInfo', function () {
	it('makes port default to 27017', function () {
		var parsed;
		parsed = getConnectionInfo('somedb');
		return assert.equal(parsed.port, 27017);
	});
	it('makes protocol default to mongodb', function () {
		var parsed;
		parsed = getConnectionInfo('somedb');
		return assert.equal(parsed.protocol, 'mongodb');
	});
	it('makes hostname default to localhost', function () {
		var parsed;
		parsed = getConnectionInfo('somedb');
		return assert.equal(parsed.hostname, 'localhost');
	});
	it('parses connection string instead of defaulting it away', function () {
		var parsed;
		parsed = getConnectionInfo(
			'mongodb://heroku:secret@staff.mongohq.com:10092/app1321916260066'
		);
		assert.equal(parsed.hostname, 'staff.mongohq.com');
		assert.equal(parsed.port, '10092');
		assert.equal(parsed.host, 'staff.mongohq.com:10092');
		assert.equal(parsed.database, 'app1321916260066');
		assert.equal(parsed.username, 'heroku');
		assert.equal(parsed.password, 'secret');
		return assert.equal(parsed.protocol, 'mongodb');
	});
	return it('gives host as [hostname]:[port]', function () {
		var parsed;
		parsed = getConnectionInfo('somedb');
		return assert.equal(parsed.host, 'localhost:27017');
	});
});
