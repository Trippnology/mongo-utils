var assert, connString, expectedCommand, fixturesDir, path, quoted, utils;

assert = require('assert');

path = require('path');

fixturesDir = path.resolve(__dirname, 'fixtures');

connString =
	'mongodb://heroku:flk3ungh0x3anflx1bab@staff.mongohq.com:10092/app1321916260066';

quoted = function (args) {
	return args
		.map(function (arg) {
			return process.platform === 'win32' ? arg : "'" + arg + "'";
		})
		.join(' ');
};

expectedCommand =
	'mongorestore ' +
	quoted([
		'--db',
		'app1321916260066',
		'--host',
		'staff.mongohq.com:10092',
		'--username',
		'heroku',
		'--password',
		'flk3ungh0x3anflx1bab',
		'--drop',
	]) +
	' ' +
	quoted([fixturesDir + '/fake-dump-dir/databasename']);

utils = require('../');

describe('makeRestoreCommand', function () {
	it('converts query string and dirname to a mongorestore command', function () {
		var command, dirName;
		dirName = '' + fixturesDir + '/fake-dump-dir';
		command = utils.makeRestoreCommand(connString, dirName);
		return assert.equal(command, expectedCommand);
	});
	it('throws an error if source directory does not exist', function () {
		var dirName, error;
		dirName = '' + fixturesDir + '/not-existing';
		try {
			utils.makeDumpCommand(connString);
		} catch (_error) {
			error = _error;
			return assert.ok(true);
		}
		return assert.ok(false, 'it did not throw an error.');
	});
	it('throws an error if source directory contains more than subdirectory', function () {
		var dirName, error;
		dirName = '' + fixturesDir + '/invalid-dump-dir';
		try {
			utils.makeDumpCommand(connString);
		} catch (_error) {
			error = _error;
			return assert.ok(true);
		}
		return assert.ok(false, 'it did not throw an error.');
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
