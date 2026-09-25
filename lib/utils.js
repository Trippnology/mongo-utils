var exec,
	fs,
	makeArgumentString,
	makeCommandArguments,
	makeCommandOptions,
	msonStringify,
	parseURL,
	stringifyArray,
	stringifyDbRef,
	stringifyPlainObject,
	utils;

exec = require('child_process').exec;

parseURL = require('url').parse;

fs = require('fs');

module.exports = utils = {};

utils.log = function () {};

utils.loggedExec = function (command, next) {
	utils.log('> ' + command);
	return exec(command, next);
};

utils.parseConnectionString = function (connectionString) {
	var info, parsedURL, _ref;
	parsedURL = parseURL(connectionString);
	info = {};
	info.hostname = parsedURL.hostname;
	info.port = parsedURL.port;
	info.host = info.port
		? '' + info.hostname + ':' + info.port
		: info.hostname;
	info.database = info.db =
		parsedURL.pathname && parsedURL.pathname.replace(/\//g, '');
	if (parsedURL.auth) {
		(_ref = parsedURL.auth.split(':')),
			(info.username = _ref[0]),
			(info.password = _ref[1]);
	}
	return info;
};

utils.getConnectionInfo = function (connectionString) {
	var info;
	info = utils.parseConnectionString(connectionString);
	info = {};
	info.protocol = info.protocol || 'mongodb';
	info.hostname = info.hostname || 'localhost';
	info.port = info.port || 27017;
	info.host = info.port
		? '' + info.hostname + ':' + info.port
		: info.hostname;
	return info;
};

utils.dumpDatabase = function (connectionString, dirName, next) {
	var dumpCommand;
	dumpCommand = utils.makeDumpCommand(connectionString, dirName);
	return utils.loggedExec(dumpCommand, function (err, stdOut, stdErr) {
		if (err) {
			return next(err);
		}
		return next(null, stdOut, stdErr);
	});
};

utils.restoreDatabase = function (connectionString, dirName, next) {
	var restoreCommand;
	restoreCommand = utils.makeRestoreCommand(connectionString, dirName);
	return utils.loggedExec(restoreCommand, function (err, stdOut, stdErr) {
		if (err) {
			return next(err);
		}
		return next(null, stdOut, stdErr);
	});
};

utils.makeDumpCommand = function (connectionString, dirName) {
	var argumentString, commandArguments, commandOptions, connectionParameters;
	if (!dirName) {
		throw 'No target directory given.';
	}
	if (typeof dirName !== 'string') {
		throw 'Target directory must be a string';
	}
	connectionParameters = utils.parseConnectionString(connectionString);
	commandOptions = makeCommandOptions(connectionParameters);
	commandOptions.out = dirName;
	commandArguments = makeCommandArguments(commandOptions);
	argumentString = makeArgumentString(commandArguments);
	return 'mongodump' + argumentString;
};

utils.makeRestoreCommand = function (connectionString, dirName) {
	var actualDirName,
		argumentString,
		commandArguments,
		commandOptions,
		connectionParameters;
	if (!dirName) {
		throw 'No source directory given.';
	}
	if (typeof dirName !== 'string') {
		throw 'Source directory must be a string';
	}
	actualDirName = utils.findDumpDirName(dirName);
	utils.log('Using ' + actualDirName);
	connectionParameters = utils.parseConnectionString(connectionString);
	commandOptions = makeCommandOptions(connectionParameters);
	commandOptions.drop = true;
	commandArguments = makeCommandArguments(commandOptions, actualDirName);
	argumentString = makeArgumentString(commandArguments);
	return 'mongorestore' + argumentString;
};

utils.findDumpDirName = function (dirName) {
	var dirCount, entryName, lastDirName, _i, _len, _ref;
	dirCount = 0;
	_ref = fs.readdirSync(dirName);
	for (_i = 0, _len = _ref.length; _i < _len; _i++) {
		entryName = _ref[_i];
		if (fs.statSync('' + dirName + '/' + entryName).isDirectory()) {
			dirCount += 1;
			lastDirName = entryName;
		}
	}
	switch (dirCount) {
		case 0:
			return dirName;
		case 1:
			return dirName + '/' + lastDirName;
		default:
			throw new Error('' + dirName + ' contains multiple directories.');
	}
};

utils.makeFindCommand = function (collectionName, query, options) {
	var command;
	if (options == null) {
		options = {};
	}
	command = 'db.' + collectionName + '.find(' + msonStringify(query);
	if (options.fields) {
		command += ',' + JSON.stringify(options.fields);
	}
	command += ')';
	if (options.sort) {
		command += '.sort(' + JSON.stringify(options.sort) + ')';
	}
	return command;
};

makeCommandOptions = function (connParams) {
	var options;
	options = {};
	options.db = connParams.db;
	if (connParams.host !== 'localhost') {
		options.host = connParams.host;
	}
	if (connParams.username) {
		options.username = connParams.username;
	}
	if (connParams.password) {
		options.password = connParams.password;
	}
	return options;
};

makeCommandArguments = function (options, object) {
	var args, name, value;
	args = [];
	for (name in options) {
		value = options[name];
		if (value !== false) {
			args.push('--' + name);
		}
		if (!(value === true || value === false)) {
			args.push('' + value);
		}
	}
	if (object) {
		args.push(object);
	}
	return args;
};

makeArgumentString = function (args) {
	var arg, str, _i, _len;
	str = '';
	for (_i = 0, _len = args.length; _i < _len; _i++) {
		arg = args[_i];
		if (process.platform === 'win32') {
			str += ' ' + arg;
		} else {
			str += " '" + arg + "'";
		}
	}
	return str;
};

// MSON stringify, ported from mongoson 0.2.0 (MIT, (c) 2013 Meryn Stol).
// Dispatches on constructor.name (not instanceof) so objects created by any
// bson copy (driver-bundled or standalone) stringify the same way.
msonStringify = function (value) {
	var name;
	if (typeof value === 'function' || value === undefined) {
		return;
	}
	if (value === null) {
		return 'null';
	}
	name = value.constructor.name;
	if (name === 'DBRef') {
		return stringifyDbRef(value);
	}
	if (name === 'ObjectID' || name === 'ObjectId') {
		return 'ObjectId("' + value.toString() + '")';
	}
	if (value instanceof Date) {
		return 'ISODate("' + value.toISOString() + '")';
	}
	if (value instanceof Array) {
		return stringifyArray(value);
	}
	if (typeof value !== 'object') {
		return JSON.stringify(value);
	}
	if (name === 'Object') {
		return stringifyPlainObject(value);
	}
	throw new Error(
		"Object contains value with unknown prototype '" + name + "'"
	);
};

stringifyPlainObject = function (object) {
	var fieldLiterals, key, value, _ref;
	fieldLiterals = [];
	for (key in object) {
		value = object[key];
		if ((_ref = typeof value) !== 'function' && _ref !== 'undefined') {
			fieldLiterals.push(JSON.stringify(key) + ':' + msonStringify(value));
		}
	}
	return '{' + fieldLiterals.join(',') + '}';
};

stringifyDbRef = function (dbRef) {
	var refJSON;
	refJSON = {};
	refJSON.$ref = dbRef.namespace;
	refJSON.$id = dbRef.oid;
	if (dbRef.db != null) {
		refJSON.$db = dbRef.db;
	}
	return JSON.stringify(refJSON);
};

stringifyArray = function (array) {
	return '[' + array.map(msonStringify).join(',') + ']';
};
