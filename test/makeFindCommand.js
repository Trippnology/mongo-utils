var assert, bson, query, utils;

assert = require('assert');

bson = require('bson');

utils = require('../');

query = {
	ownerId: '6ac4f70f-fe05-4a7d-bba8-99d6fbe62261',
};

describe('makeFindCommand', function () {
	it('works with a sole query object', function () {
		var expected, generated;
		generated = utils.makeFindCommand('nodes', query);
		expected =
			'db.nodes.find({"ownerId":"6ac4f70f-fe05-4a7d-bba8-99d6fbe62261"})';
		return assert.equal(generated, expected);
	});
	it("works when options object has 'sort' field", function () {
		var expected, generated;
		generated = utils.makeFindCommand('nodes', query, {
			sort: {
				addedAt: 1,
			},
		});
		expected =
			'db.nodes.find({"ownerId":"6ac4f70f-fe05-4a7d-bba8-99d6fbe62261"}).sort({"addedAt":1})';
		return assert.equal(generated, expected);
	});
	it("works when options object has 'fields' field", function () {
		var expected, generated;
		generated = utils.makeFindCommand('nodes', query, {
			fields: {
				value: 1,
				addedAt: 1,
				changedAt: 1,
			},
		});
		expected =
			'db.nodes.find({"ownerId":"6ac4f70f-fe05-4a7d-bba8-99d6fbe62261"},{"value":1,"addedAt":1,"changedAt":1})';
		return assert.equal(generated, expected);
	});
	it('stringifies ObjectId values as ObjectId literals', function () {
		var expected, generated;
		generated = utils.makeFindCommand('nodes', {
			ownerId: new bson.ObjectId('507f1f77bcf86cd799439011'),
		});
		expected =
			'db.nodes.find({"ownerId":ObjectId("507f1f77bcf86cd799439011")})';
		return assert.equal(generated, expected);
	});
	it('stringifies Date values as ISODate literals', function () {
		var expected, generated;
		generated = utils.makeFindCommand('nodes', {
			addedAt: new Date('2026-09-25T10:11:12.000Z'),
		});
		expected =
			'db.nodes.find({"addedAt":ISODate("2026-09-25T10:11:12.000Z")})';
		return assert.equal(generated, expected);
	});
	it('stringifies DBRef values as extended JSON', function () {
		var expected, generated;
		generated = utils.makeFindCommand('nodes', {
			parent: new bson.DBRef(
				'nodes',
				new bson.ObjectId('507f1f77bcf86cd799439011'),
				'databasename'
			),
		});
		expected =
			'db.nodes.find({"parent":{"$ref":"nodes","$id":"507f1f77bcf86cd799439011","$db":"databasename"}})';
		return assert.equal(generated, expected);
	});
	it('stringifies nested objects and arrays', function () {
		var expected, generated;
		generated = utils.makeFindCommand('nodes', {
			meta: {
				count: 3,
				tags: ['alpha', 'beta'],
			},
		});
		expected =
			'db.nodes.find({"meta":{"count":3,"tags":["alpha","beta"]}})';
		return assert.equal(generated, expected);
	});
	return it('drops undefined and function values like mongoson did', function () {
		var expected, generated;
		generated = utils.makeFindCommand('nodes', {
			ownerId: 'ok',
			skipped: undefined,
			fn: function () {},
		});
		expected = 'db.nodes.find({"ownerId":"ok"})';
		return assert.equal(generated, expected);
	});
});
