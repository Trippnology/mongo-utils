var assert, connString, dirName, expectedCommand, quoted, utils;

assert = require('assert');

connString =
	'mongodb://heroku:flk3ungh0x3anflx1bab@staff.mongohq.com:10092/app1321916260066';

dirName = '/dumps/mongodb/some-backup';

quoted = function (args) {
	return args
		.map(function (arg) {
			return process.platform === 'win32' ? arg : "'" + arg + "'";
		})
		.join(' ');
};

expectedCommand =
	'mongodump ' +
	quoted([
		'--db',
		'app1321916260066',
		'--host',
		'staff.mongohq.com:10092',
		'--username',
		'heroku',
		'--password',
		'flk3ungh0x3anflx1bab',
		'--out',
		dirName,
	]);

utils = require('../');

describe('makeDumpCommand', function () {
	it('converts query string and dirname to a mongodump command', function () {
		var command;
		command = utils.makeDumpCommand(connString, dirName);
		return assert.equal(command, expectedCommand);
	});
	return it('throws an error if no dirName is given', function () {
		var error;
		try {
			utils.makeDumpCommand(connString);
		} catch (_error) {
			error = _error;
			return assert.ok(true);
		}
		return assert.ok(false, 'it did not throw an error.');
	});
});
