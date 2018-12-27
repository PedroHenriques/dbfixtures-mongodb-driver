'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

describe('Close', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyClose;

  beforeEach(function () {
    doubles = {
      mongoClientStub: { close: sandbox.stub() },
    };
    proxyClose = proxyquire('../../dist/close', {
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {
    it('should be a function', function () {
      assert.typeOf(proxyClose.default, 'function');
    });

    it('should return a function when called', function () {
      assert.typeOf(proxyClose.default(), 'function');
    });

    describe('returned function', function () {
      let returnedFunction;
      beforeEach(function () {
        returnedFunction = proxyClose.default(doubles.mongoClientStub);
      });

      it('should call the close() of the object received as argument by the default export once', function () {
        returnedFunction();
        assert.isTrue(doubles.mongoClientStub.close.calledOnce);
      });
      
      it('should call the close() of the object received as argument by the default export with no arguments', function () {
        returnedFunction();
        assert.strictEqual(doubles.mongoClientStub.close.args[0].length, 0);
      });

      describe('if the call to close() returns a promise that resolves', function () {
        it('should return a promise that resolves with void', function () {
          doubles.mongoClientStub.close.returns(Promise.resolve());
          return(
            returnedFunction()
            .then(function (result) {
              assert.isUndefined(result);
            })
          );
        });
      });
      
      describe('if the call to close() returns a promise that rejects', function () {
        it('should return a promise that rejects with that Error object', function () {
          const testError = new Error('test error message');
          doubles.mongoClientStub.close.returns(Promise.reject(testError));
          return(
            returnedFunction()
            .then(function () {
              assert.fail();
            })
            .catch(function (error) {
              assert.strictEqual(error, testError);
            })
          );
        });
      });
    });
  });
});