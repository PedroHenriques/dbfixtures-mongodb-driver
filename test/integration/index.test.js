'use strict';
const chai = require('chai');
const assert = chai.assert;

const sutModule = require('../../dist/index');
const mongo = require('mongodb');

describe('Entry point', function () {
  let client;
  let Db;
  let moduleValue;
  before(async function () {
    const promises = [];

    promises.push(
      mongo.MongoClient.connect(
        'mongodb://localhost:27017/',
        { useNewUrlParser: true }
      )
      .then(function (mongoClient) {
        client = mongoClient;
        Db = mongoClient.db('test');
      })
    );
    promises.push(
      sutModule.create({
        connectURI: 'mongodb://localhost:27017/', connectOptions: { useNewUrlParser: true },
        dbName: 'test',
      })
      .then(function (result) {
        moduleValue = result;
      })
    );

    await Promise.all(promises);
  });

  after(function () {
    client.close();
    moduleValue.close();
  });

  beforeEach(async function () {
    const usersCollection = Db.collection('users');
    const rolesCollection = Db.collection('roles');

    await Promise.all([
      usersCollection.deleteMany({}),
      rolesCollection.deleteMany({}),
    ]);

    const promises = [];

    promises.push(usersCollection.insertMany([
      { email: 'user1@email.com', name: 'Test User 1' },
      { email: 'user2@test.eu', name: 'Another Test User' },
    ]));
    promises.push(rolesCollection.insertMany([
      { desig: 'test' },
      { desig: 'regular' },
      { desig: 'admin' },
      { desig: 'super admin' },
    ]));

    await Promise.all(promises);
  });

  it('should return an object with the expected properties', function () {
    assert.hasAllKeys(moduleValue, [ 'truncate', 'insertFixtures', 'close' ]);
  });

  describe('"truncate" property of the returned object', function () {
    it('should remove all documents from the selected collection', async function () {
      const usersCollection = Db.collection('users');
      const rolesCollection = Db.collection('roles');

      await Promise.all([
        usersCollection.find({}).count(),
        rolesCollection.find({}).count(),
      ])
      .then(function (results) {
        assert.strictEqual(results[0], 2);
        assert.strictEqual(results[1], 4);
      });

      await moduleValue.truncate(['users']);

      await Promise.all([
        usersCollection.find({}).count(),
        rolesCollection.find({}).count(),
      ])
      .then(function (results) {
        assert.strictEqual(results[0], 0);
        assert.strictEqual(results[1], 4);
      });
    });
  });

  describe('"insertFixtures" property of the returned object', function () {
    it('should insert the provided documents into the selected collection', async function () {
      const usersCollection = Db.collection('users');
      const rolesCollection = Db.collection('roles');

      await Promise.all([
        usersCollection.find({}).count(),
        rolesCollection.find({}).count(),
      ])
      .then(function (results) {
        assert.strictEqual(results[0], 2);
        assert.strictEqual(results[1], 4);
      });

      await moduleValue.insertFixtures('roles', [ { desig: 'other role' }, { desig: 'yet another role' } ]);

      await Promise.all([
        usersCollection.find({}).count(),
        rolesCollection.find({}).count(),
      ])
      .then(function (results) {
        assert.strictEqual(results[0], 2);
        assert.strictEqual(results[1], 6);
      });
    });
  });

  describe('"close" property of the returned object', function () {
    it('should close the connection to the DB', async function () {
      await moduleValue.close();

      try {
        await moduleValue.truncate('users');
      } catch (error) {
        assert.strictEqual(error.name, 'MongoError');
        assert.strictEqual(error.message, 'server instance pool was destroyed');
      }
    });
  });
});