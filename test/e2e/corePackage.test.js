'use strict';
const chai = require('chai');
const assert = chai.assert;

const dbFixtures = require('dbfixtures');
const sutModule = require('../../dist/index');
const mongo = require('mongodb');

describe('Entry point', function () {
  let client;
  let Db;
  let mongoDriver;
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
        mongoDriver = result;
      })
    );

    await Promise.all(promises);

    dbFixtures.setDrivers(mongoDriver);
  });

  after(function () {
    client.close();
    mongoDriver.close();
  });

  beforeEach(async function () {
    const usersCollection = Db.collection('users');
    const rolesCollection = Db.collection('roles');

    await Promise.all([
      usersCollection.deleteMany({}),
      rolesCollection.deleteMany({}),
    ]);
  });

  it('should interact with the node driver correctly', async function () {
    const usersCollection = Db.collection('users');
    const rolesCollection = Db.collection('roles');
    const fixtures = {
      'users': [
        { id: 1, email: 'myemail@test.net', role_id: 2 },
        { id: 2, email: 'test@gmail.com', role_id: 1 },
        { id: 3, email: 'another@email.org', role_id: 1 },
      ],
      'roles': [
        { id: 1, name: 'role 1' },
        { id: 2, name: 'role 2' },
      ],
    };

    await Promise.all([
      usersCollection.find({}).count(),
      rolesCollection.find({}).count(),
    ])
    .then(function (results) {
      assert.strictEqual(results[0], 0);
      assert.strictEqual(results[1], 0);
    });

    await dbFixtures.insertFixtures(fixtures);

    await Promise.all([
      usersCollection.find({}).count(),
      rolesCollection.find({}).count(),
    ])
    .then(function (results) {
      assert.strictEqual(results[0], 3);
      assert.strictEqual(results[1], 2);
    });
  });
});