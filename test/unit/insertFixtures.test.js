'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

const insertFixtures = require('../../dist/insertFixtures');

describe('Insert Fixtures', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyInsertFixtures;

  beforeEach(function () {
    doubles = {
      mongoDbStub: { collection: sandbox.stub() },
      mongoCollectionStub: { insertMany: sandbox.stub() },
      insertFixturesStub: sandbox.stub(insertFixtures),
    };
    proxyInsertFixtures = proxyquire('../../dist/insertFixtures', {
      './insertFixtures': doubles.insertFixturesStub,
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    it('should be a function', function () {
      assert.typeOf(proxyInsertFixtures.default, 'function');
    });

    it('should return a function when called', function () {
      assert.typeOf(proxyInsertFixtures.default(), 'function');
    });

    describe('returned function', function () {
      let returnedFunction;
      beforeEach(function () {
        doubles.mongoDbStub.collection.returns(doubles.mongoCollectionStub);
        doubles.mongoCollectionStub.insertMany.returns(Promise.resolve({ result: { ok: 1 } }));

        returnedFunction = proxyInsertFixtures.default(doubles.mongoDbStub);
      });

      it('should call the collection() property of the db object provided as argument to the default export once', function () {
        returnedFunction();
        assert.isTrue(doubles.mongoDbStub.collection.calledOnce);
      });
      
      it('should call the collection() property of the db object provided as argument to the default export with 1 argument', function () {
        returnedFunction();
        assert.strictEqual(doubles.mongoDbStub.collection.args[0].length, 1);
      });
      
      it('should call the collection() property of the db object provided as argument to the default export with the value of the 1st argument provided to this function', function () {
        const collectionName = 'test collection name';
        returnedFunction(collectionName);
        assert.strictEqual(doubles.mongoDbStub.collection.args[0][0], collectionName);
      });

      it('should call the insertMany() of the object returned by the call to collection() once', function () {
        returnedFunction('');
        assert.isTrue(doubles.mongoCollectionStub.insertMany.calledOnce);
      });
      
      it('should call the insertMany() of the object returned by the call to collection() with 1 argument', function () {
        returnedFunction('');
        assert.strictEqual(doubles.mongoCollectionStub.insertMany.args[0].length, 1);
      });
      
      it('should call the insertMany() of the object returned by the call to collection() with the value of the 2nd argument provided to this function', function () {
        const fixtures = [];
        returnedFunction('', fixtures);
        assert.strictEqual(doubles.mongoCollectionStub.insertMany.args[0][0], fixtures);
      });

      describe('if the call to insertMany() returns a promise that resolves', function () {
        describe('if the resolved object has the "result.ok" property set to 1', function () {
          it('should return a promise that resolves with void', function () {
            doubles.mongoCollectionStub.insertMany.returns(Promise.resolve({ result: { ok: 1 } }));
            return(
              returnedFunction()
              .then(function (result) {
                assert.isUndefined(result);
              })
            );
          });
        });
        
        describe('if the resolved object has the "result.ok" property set to a value other than 1', function () {
          it('should return a promise that rejects with an Error object', function () {
            doubles.mongoCollectionStub.insertMany.returns(Promise.resolve({ result: { ok: null } }));
            return(
              returnedFunction()
              .then(function () {
                assert.fail();
              })
              .catch(function (error) {
                assert.typeOf(error, 'error');
              })
            );
          });
          
          it('should return a promise that rejects with an Error object containing a custom error message', function () {
            doubles.mongoCollectionStub.insertMany.returns(Promise.resolve({ result: { ok: null, n: 4 } }));
            return(
              returnedFunction('test collection')
              .catch(function (error) {
                assert.strictEqual(error.message, 'Failed to insert the fixtures for the collection "test collection", having inserted 4 documents.');
              })
            );
          });
        });
      });

      describe('if the call to insertMany() returns a promise that rejects', function () {
        it('should return a promise that rejects with that Error object', function () {
          const testError = new Error('test error message');
          doubles.mongoCollectionStub.insertMany.returns(Promise.reject(testError));
          return(
            returnedFunction()
            .catch(function (error) {
              assert.strictEqual(error, testError);
            })
          );
        });
      });
    });
  });
});