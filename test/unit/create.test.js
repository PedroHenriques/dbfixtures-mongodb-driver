'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const truncate = require('../../dist/truncate');
const insertFixtures = require('../../dist/insertFixtures');
const close = require('../../dist/close');

describe('Create', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyCreate;

  beforeEach(function () {
    doubles = {
      mongoConnectStub: sandbox.stub(),
      mongoDbStub: sandbox.stub(),
      truncateStub: sandbox.stub(truncate),
      insertFixturesStub: sandbox.stub(insertFixtures),
      closeStub: sandbox.stub(close),
    };
    proxyCreate = proxyquire('../../dist/create', {
      'mongodb': {
        connect: doubles.mongoConnectStub,
      },
      './truncate': doubles.truncateStub,
      './insertFixtures': doubles.insertFixturesStub,
      './close': doubles.closeStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    beforeEach(function () {
      doubles.mongoConnectStub.returns(Promise.resolve({
        db: doubles.mongoDbStub,
      }));
    });

    it('should be a function', function () {
      assert.typeOf(proxyCreate.default, 'function');
    });

    it('should return an object', function () {
      return(
        proxyCreate.default({})
        .then(function (create) {
          assert.typeOf(create, 'object');
        })
      );
    });

    it('should call the connect() function of the mongodb module once', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.isTrue(doubles.mongoConnectStub.calledOnce);
        })
      );
    });
    
    it('should call the connect() function of the mongodb module with 2 argument', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.mongoConnectStub.args[0].length, 2);
        })
      );
    });

    describe('1st argument passed to the connect() function of the mongodb module', function () {
      it('should be the "connectURI" property of the object provided as argument to the default export', function () {
        const arg = { connectURI: 'test connection url' };
        return(
          proxyCreate.default(arg)
          .then(function () {
            assert.strictEqual(doubles.mongoConnectStub.args[0][0], arg.connectURI);
          })
        );
      });
    });
    
    describe('2nd argument passed to the connect() function of the mongodb module', function () {
      it('should be the "connectOptions" property of the object provided as argument to the default export', function () {
        const arg = { connectOptions: {} };
        return(
          proxyCreate.default(arg)
          .then(function () {
            assert.strictEqual(doubles.mongoConnectStub.args[0][1], arg.connectOptions);
          })
        );
      });
    });

    describe('if the connect() function of the mongodb module returns a promise that rejects', function () {
      it('should return a promise that rejects with that Error object', function () {
        const testError = new Error('test error message');
        doubles.mongoConnectStub.returns(Promise.reject(testError));
        return(
          proxyCreate.default({})
          .then(function () {
            assert.fail();
          })
          .catch(function (error) {
            assert.strictEqual(error, testError);
          })
        );
      });
    })

    it('should call the db() method of the return object from the call to the MongoClient constructor once', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.isTrue(doubles.mongoDbStub.calledOnce);
        })
      );
    });
    
    it('should call the db() method of the return object from the call to the MongoClient constructor with 2 arguments', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.mongoDbStub.args[0].length, 2);
        })
      );
    });

    describe('1st argument passed to the db() method of mongodb', function () {
      it('should be the "dbName" property of the object provided as argument to the default export', function () {
        const arg = { dbName: 'test db name' };
        return(
          proxyCreate.default(arg)
          .then(function () {
            assert.strictEqual(doubles.mongoDbStub.args[0][0], arg.dbName);
          })
        );
      });
    });
    
    describe('2nd argument passed to the db() method of mongodb', function () {
      it('should be the "dbOptions" property of the object provided as argument to the default export', function () {
        const arg = { dbOptions: {} };
        return(
          proxyCreate.default(arg)
          .then(function () {
            assert.strictEqual(doubles.mongoDbStub.args[0][1], arg.dbOptions);
          })
        );
      });
    });

    it('should call the default export of the "truncate" module once', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.isTrue(doubles.truncateStub.default.calledOnce);
        })
      );
    });
    
    it('should call the default export of the "truncate" module with 1 argument', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.truncateStub.default.args[0].length, 1);
        })
      );
    });
    
    it('should call the default export of the "truncate" module with the object returned from the call to db() of mongodb', function () {
      const dbObject = {};
      doubles.mongoDbStub.returns(dbObject);

      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.truncateStub.default.args[0][0], dbObject);
        })
      );
    });

    it('should call the default export of the "insertFixtures" module once', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.isTrue(doubles.insertFixturesStub.default.calledOnce);
        })
      );
    });
    
    it('should call the default export of the "insertFixtures" module with 1 argument', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.insertFixturesStub.default.args[0].length, 1);
        })
      );
    });
    
    it('should call the default export of the "insertFixtures" module with the object returned from the call to db() of mongodb', function () {
      const dbObject = {};
      doubles.mongoDbStub.returns(dbObject);

      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.insertFixturesStub.default.args[0][0], dbObject);
        })
      );
    });

    it('should call the default export of the "close" module once', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.isTrue(doubles.closeStub.default.calledOnce);
        })
      );
    });
    
    it('should call the default export of the "close" module with 1 argument', function () {
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.closeStub.default.args[0].length, 1);
        })
      );
    });
    
    it('should call the default export of the "close" module with the return value of the call to the MongoClient constructor', function () {
      const client = { db: sandbox.stub() };
      doubles.mongoConnectStub.returns(Promise.resolve(client));
      return(
        proxyCreate.default({})
        .then(function () {
          assert.strictEqual(doubles.closeStub.default.args[0][0], client);
        })
      );
    });

    describe('returned object', function () {
      it('should have the properties expected by the core package', function () {
        return(
          proxyCreate.default({})
          .then(function (create) {
            assert.hasAllKeys(create, [ 'truncate', 'insertFixtures', 'close' ]);
          })
        );
      });

      describe('"truncate" property', function () {
        it('should have the return value of the call to the default export of the "truncate" module', function () {
          const truncate = sandbox.stub();
          doubles.truncateStub.default.returns(truncate);
          return(
            proxyCreate.default({})
            .then(function (create) {
              assert.strictEqual(create.truncate, truncate);
            })
          );
        });
      });
      
      describe('"insertFixtures" property', function () {
        it('should have the return value of the call to the default export of the "insertFixtures" module', function () {
          const insertFixtures = sandbox.stub();
          doubles.insertFixturesStub.default.returns(insertFixtures);
          return(
            proxyCreate.default({})
            .then(function (create) {
              assert.strictEqual(create.insertFixtures, insertFixtures);
            })
          );
        });
      });
      
      describe('"close" property', function () {
        it('should have the return value of the call to the default export of the "close" module', function () {
          const close = sandbox.stub();
          doubles.closeStub.default.returns(close);
          return(
            proxyCreate.default({})
            .then(function (create) {
              assert.strictEqual(create.close, close);
            })
          );
        });
      });
    });
  });
});