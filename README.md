[![Build Status](https://travis-ci.org/PedroHenriques/dbfixtures-mongodb-driver.svg?branch=master)](https://travis-ci.org/PedroHenriques/dbfixtures-mongodb-driver)

# Fixtures Manager MongoDB Driver

An abstraction layer for the [mongodb package](https://www.npmjs.com/package/mongodb) to facilitate handling database fixtures for testing purposes, in a MongoDB database.
This package is ment to be used in conjunction with the [dbfixtures package](https://www.npmjs.com/package/dbfixtures), but can also be used by itself.

## Installation

```sh
npm install dbfixtures-mongodb-driver
```

## Usage

This package exposes the `create({ connectURI: string, connectOptions?: MongoClientOptions, dbName: string, dbOptions?: MongoClientCommonOption }): Promise<IDriver>` function that returns a Promise that resolves with an instance of the driver.  

**Note1:** For detailed information about the `connectURI` and `connectOptions` arguments, please consult the [MongoDB NodeJS driver's connect documentation](http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html#.connect).  
**Note2:** For detailed information about the `MongoClientCommonOption` argument, please consult the [MongoDB NodeJS driver's DB documentation](http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html#db).

An instance of the driver exposes the following interface

```js
// truncates the collections (i.e., "tables") with the supplied names
truncate: (tableNames: string[]) => Promise<void>

// inserts the supplied documents into the specified collection (i.e., "table")
insertFixtures: (tableName: string, fixtures: [{}]) => Promise<void>

// terminates the connection to the database
close: () => Promise<void>
```

### Example

This example uses [Mocha](https://mochajs.org/) as the potential test runner.

```js
const dbfixtures = require('dbfixtures');
const fixturesMongoDriver = require('dbfixtures-mongo-driver');

const mongodbDriverInfo = {
  connectURI: 'mongodb://localhost:27017/',
  connectOptions: { useNewUrlParser: true },
  dbName: 'test',
};
const fixtures = {
  'roles': [
    { id: 1, name: 'role 1' },
    { id: 2, name: 'role 2' },
  ],
  'users': [
    { id: 1, email: 'myemail@test.net', role_id: 2 },
    { id: 2, email: 'test@gmail.com', role_id: 1 },
    { id: 3, email: 'another@email.org', role_id: 1 },
  ],
};

describe('fixtures example', function () {
  before(async function () {
    const mongodbDriver = await fixturesMongoDriver.create(mongodbDriverInfo);
    dbfixtures.setDrivers(mongodbDriver);
  });

  after(async function () {
    await dbfixtures.closeDrivers();
  });

  beforeEach(async function () {
    await dbfixtures.insertFixtures(fixtures);
  });

  it('should have the database seeded with the fixtures', function () {
    // ...
  });
});
```

## Testing This Package

* `cd` into the package's directory
* run `npm install`
* run `npm run build`

* for unit tests run `npm test -- test\unit\`

* for integration tests run `npm test -- test\integration\`  
**NOTE:** requires an active MongoDB server available at `localhost:27017`

* for end-to-end tests run `npm test -- test\e2e\`  
**NOTE:** requires an active MongoDB server available at `localhost:27017`

### Suggestion to setting up a MongoDB server on your local machine

If you are using `Docker`, you can run the CLI command `docker run --name testmongo -p 127.0.0.1:27017:27017/tcp mongo:4` to raise a container with the MongoDB v4.* image and make it available through `localhost:27017`.