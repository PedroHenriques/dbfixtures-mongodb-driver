'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const chai = require('chai');
const assert = chai.assert;

describe('Truncate', function () {
  const sandbox = sinon.createSandbox();
  let doubles;
  let proxyTruncate;

  beforeEach(function () {
    doubles = {
      collectionStub: sandbox.stub(),
      deleteManyStub: sandbox.stub(),
    };
    proxyTruncate = proxyquire('../../dist/truncate', {});
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('default export', function () {  
    it('should be a function', function () {
      assert.typeOf(proxyTruncate.default, 'function');
    });
    
    it('should return a function', function () {
      assert.typeOf(proxyTruncate.default(), 'function');
    });

    describe('returned function', function () {
      let truncate;

      beforeEach(function () {
        truncate = proxyTruncate.default({
          collection: doubles.collectionStub,
        });
      });

      describe('if the provided array has 1 element', function () {  
        beforeEach(function () {
          doubles.collectionStub.onCall(0).returns({
            deleteMany: doubles.deleteManyStub,
          });
          doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: 1 } }));
        });

        it('should call the collection() property of the object provided as argument to the default export once', function () {
          return(
            truncate([ 'collection1' ])
            .then(function () {
              assert.isTrue(doubles.collectionStub.calledOnce);
            })
          );
        });
        
        it('should call the collection() property of the object provided as argument to the default export with 1 argument', function () {
          return(
            truncate([ 'collection1' ])
            .then(function () {
              assert.strictEqual(doubles.collectionStub.args[0].length, 1);
            })
          );
        });
        
        it('should call the collection() property of the object provided as argument to the default export with the 1st element of the array', function () {
          return(
            truncate([ 'collection1' ])
            .then(function () {
              assert.strictEqual(doubles.collectionStub.args[0][0], 'collection1');
            })
          );
        });
        
        it('should call the deleteMany() property on the return value of the call to collection() once', function () {
          doubles.collectionStub.returns({
            deleteMany: doubles.deleteManyStub,
          });
          return(
            truncate([ 'collection2' ])
            .then(function () {
              assert.isTrue(doubles.deleteManyStub.calledOnce);
            })
          );
        });
        
        it('should call the deleteMany() property on the return value of the call to collection() with 1 argument', function () {
          doubles.collectionStub.returns({
            deleteMany: doubles.deleteManyStub,
          });
          return(
            truncate([ 'collection2' ])
            .then(function () {
              assert.strictEqual(doubles.deleteManyStub.args[0].length, 1);
            })
          );
        });
        
        it('should call the deleteMany() property on the return value of the call to collection() with an empty object', function () {
          doubles.collectionStub.returns({
            deleteMany: doubles.deleteManyStub,
          });
          return(
            truncate([ 'collection2' ])
            .then(function () {
              assert.deepEqual(doubles.deleteManyStub.args[0][0], {});
            })
          );
        });

        describe('if the call to deleteMany() returns a promise that resolves', function () {
          describe('if the resolve object has the "ok" property set to 1', function () {
            it('should return a promise that resolves with void', function () {
              doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: 1 } }));
              return(
                truncate([ 'collection3' ])
                .then(function (result) {
                  assert.isUndefined(result);
                })
              );
            });
          });
          
          describe('if the resolve object has the "ok" property set to a value other than 1', function () {
            it('should return a promise that rejects with an Error object', function () {
              doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: 0 } }));
              return(
                truncate([ 'collection3' ])
                .catch(function (error) {
                  assert.typeOf(error, 'error');
                })
              );
            });
            
            it('should return a promise that rejects with an Error object with a custom error message', function () {
              doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: 0, n: 0 } }));
              return(
                truncate([ 'collection3' ])
                .catch(function (error) {
                  assert.strictEqual(error.message, 'Failed to truncate "collection3", having deleted 0 documents.');
                })
              );
            });
          });
        });

        describe('if the call to deleteMany() returns a promise that rejects', function () {
          it('should return a promise that rejects with that Error object', function () {
            const testError = new Error('test error message.');
            doubles.deleteManyStub.onCall(0).returns(Promise.reject(testError));
            return(
              truncate([ 'collection3' ])
              .catch(function (error) {
                assert.strictEqual(error, testError);
              })
            );
          });
        });
      });

      describe('if the provided array has 2 elements', function () {  
        beforeEach(function () {
          doubles.collectionStub.onCall(0).returns({
            deleteMany: doubles.deleteManyStub,
          });
          doubles.collectionStub.onCall(1).returns({
            deleteMany: doubles.deleteManyStub,
          });
          doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: 1 } }));
          doubles.deleteManyStub.onCall(1).returns(Promise.resolve({ result: { ok: 1 } }));
        });

        it('should call the collection() property of the object provided as argument to the default export twice', function () {
          return(
            truncate([ 'collection1', 'other collection' ])
            .then(function () {
              assert.strictEqual(doubles.collectionStub.callCount, 2);
            })
          );
        });
        
        describe('1st call to collection()', function () {
          it('should call it with 1 argument', function () {
            return(
              truncate([ 'collection1', 'other collection' ])
              .then(function () {
                assert.strictEqual(doubles.collectionStub.args[0].length, 1);
              })
            );
          });
          
          it('should call it with the 1st element of the array', function () {
            return(
              truncate([ 'collection1', 'other collection' ])
              .then(function () {
                assert.strictEqual(doubles.collectionStub.args[0][0], 'collection1');
              })
            );
          });
        });
        
        describe('2nd call to collection()', function () {
          it('should call it with 1 argument', function () {
            return(
              truncate([ 'collection1', 'other collection' ])
              .then(function () {
                assert.strictEqual(doubles.collectionStub.args[1].length, 1);
              })
            );
          });
          
          it('should call it with the 2nd element of the array', function () {
            return(
              truncate([ 'collection1', 'other collection' ])
              .then(function () {
                assert.strictEqual(doubles.collectionStub.args[1][0], 'other collection');
              })
            );
          });
        });
        
        it('should call the deleteMany() property on the return value of the call to collection() twice', function () {
          doubles.collectionStub.returns({
            deleteMany: doubles.deleteManyStub,
          });
          return(
            truncate([ 'collection1', 'other collection' ])
            .then(function () {
              assert.strictEqual(doubles.deleteManyStub.callCount, 2);
            })
          );
        });
        
        describe('1st call to deleteMany()', function () {
          it('should call it with 1 argument', function () {
            doubles.collectionStub.returns({
              deleteMany: doubles.deleteManyStub,
            });
            return(
              truncate([ 'collection1', 'other collection' ])
              .then(function () {
                assert.strictEqual(doubles.deleteManyStub.args[0].length, 1);
              })
            );
          });
          
          it('should call it with an empty object', function () {
            doubles.collectionStub.returns({
              deleteMany: doubles.deleteManyStub,
            });
            return(
              truncate([ 'collection1', 'other collection' ])
              .then(function () {
                assert.deepEqual(doubles.deleteManyStub.args[0][0], {});
              })
            );
          });
        });
        
        describe('2nd call to deleteMany()', function () {
          it('should call it with 1 argument', function () {
            doubles.collectionStub.returns({
              deleteMany: doubles.deleteManyStub,
            });
            return(
              truncate([ 'collection1', 'other collection' ])
              .then(function () {
                assert.strictEqual(doubles.deleteManyStub.args[1].length, 1);
              })
            );
          });
          
          it('should call it with an empty object', function () {
            doubles.collectionStub.returns({
              deleteMany: doubles.deleteManyStub,
            });
            return(
              truncate([ 'collection1', 'other collection' ])
              .then(function () {
                assert.deepEqual(doubles.deleteManyStub.args[1][0], {});
              })
            );
          });
        });

        describe('if the 2 calls to deleteMany() return a promise that resolves', function () {
          describe('if the resolve objects have the "ok" property set to 1', function () {
            it('should return a promise that resolves with void', function () {
              doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: 1 } }));
              doubles.deleteManyStub.onCall(1).returns(Promise.resolve({ result: { ok: 1 } }));
              return(
                truncate([ 'collection1', 'other collection' ])
                .then(function (result) {
                  assert.isUndefined(result);
                })
              );
            });
          });
          
          describe('if the resolve object, of the 1st call, has the "ok" property set to a value other than 1', function () {
            it('should return a promise that rejects with an Error object', function () {
              doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: null } }));
              doubles.deleteManyStub.onCall(1).returns(Promise.resolve({ result: { ok: 1 } }));
              return(
                truncate([ 'collection1', 'other collection' ])
                .catch(function (error) {
                  assert.typeOf(error, 'error');
                })
              );
            });
            
            it('should return a promise that rejects with an Error object with a custom error message', function () {
              doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: null, n: 3 } }));
              doubles.deleteManyStub.onCall(1).returns(Promise.resolve({ result: { ok: 1 } }));
              return(
                truncate([ 'collection1', 'other collection' ])
                .catch(function (error) {
                  assert.strictEqual(error.message, 'Failed to truncate "collection1", having deleted 3 documents.');
                })
              );
            });

            it('should call the collection() property of the object provided as argument to the default export a second time', function () {
              doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: null, n: 2 } }));
              doubles.deleteManyStub.onCall(1).returns(Promise.resolve({ result: { ok: 1 } }));
              return(
                truncate([ 'collection1', 'other collection' ])
                .catch(function () {
                  assert.strictEqual(doubles.collectionStub.callCount, 2);
                })
              );
            });
          });
          
          describe('if the resolve object, of the 2nd call, has the "ok" property set to a value other than 1', function () {
            it('should return a promise that rejects with an Error object', function () {
              doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: 1 } }));
              doubles.deleteManyStub.onCall(1).returns(Promise.resolve({ result: { ok: 3 } }));
              return(
                truncate([ 'collection1', 'other collection' ])
                .catch(function (error) {
                  assert.typeOf(error, 'error');
                })
              );
            });
            
            it('should return a promise that rejects with an Error object with a custom error message', function () {
              doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: 1 } }));
              doubles.deleteManyStub.onCall(1).returns(Promise.resolve({ result: { ok: 9, n: 10 } }));
              return(
                truncate([ 'collection1', 'other collection' ])
                .catch(function (error) {
                  assert.strictEqual(error.message, 'Failed to truncate "other collection", having deleted 10 documents.');
                })
              );
            });
          });
        });

        describe('if the 1st call to deleteMany() returns a promise that rejects', function () {
          it('should return a promise that rejects with that Error object', function () {
            const testError = new Error('test error message.');
            doubles.deleteManyStub.onCall(0).returns(Promise.reject(testError));
            return(
              truncate([ 'collection1', 'other collection' ])
              .catch(function (error) {
                assert.strictEqual(error, testError);
              })
            );
          });
        });
        
        describe('if the 2nd call to deleteMany() returns a promise that rejects', function () {
          it('should return a promise that rejects with that Error object', function () {
            const testError = new Error('test error message.');
            doubles.deleteManyStub.onCall(0).returns(Promise.resolve({ result: { ok: 1 } }));
            doubles.deleteManyStub.onCall(1).returns(Promise.reject(testError));
            return(
              truncate([ 'collection1', 'other collection' ])
              .catch(function (error) {
                assert.strictEqual(error, testError);
              })
            );
          });
        });
      });
    });
  });
});