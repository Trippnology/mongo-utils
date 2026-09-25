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
	return it('gives host as [hostname]:[port]', function () {
		var parsed;
		parsed = getConnectionInfo('somedb');
		return assert.equal(parsed.host, 'localhost:27017');
	});
});
