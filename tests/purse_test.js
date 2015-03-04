var Purse = require('../index');
var assert = require('chai').assert;
var nock = require('nock');

describe('Purse', function() {
  describe('INVALID_HTTP_CODES', function() {
    it("should be the same for the class and instance", function() {
      var purse = new Purse({url: 'foo'});
      assert.equal(Purse.INVALID_HTTP_CODES, purse.INVALID_HTTP_CODES);
    });
  });

  describe('_request', function() {
    var OPTIONS = {
      url: 'http://examplepurse.com',
      wallet_id: 1,
      method: 'foo'
    };
    // This is not a real purse method, only used for testing
    var PATH = '/wallets/' + OPTIONS.wallet_id + '/' + OPTIONS.method;

    var purse;
    beforeEach(function(done) {
      purse = new Purse({url: OPTIONS.url});
      done();
    });

    afterEach(function(done) {
      nock.cleanAll();
      done();
    });

    it("should return the body and statusCode when request succeeds", function(done) {
      nock(OPTIONS.url)
        .post(PATH)
        .reply(200, {success: true});

      purse._request(OPTIONS, function(err, resp) {
        assert.isNotNull(resp);
        assert.property(resp, 'statusCode');
        assert.property(resp, 'body');
        assert.isTrue(resp.body.success);
        done();
      });
    });
    it("should return Insufficient Balance if pursed returned 401 status", function(done) {
      nock(OPTIONS.url)
        .post(PATH)
        .reply(401, {success: false});

      purse._request(OPTIONS, function(err, resp) {
        assert.isNotNull(err);
        assert.equal(err, purse.INVALID_HTTP_CODES[401]);
        done();
      });
    });

    it("should return Wallet doesn't exist if pursed return 404 status", function(done) {
      nock(OPTIONS.url)
        .post(PATH)
        .reply(404, {success: false});

      purse._request(OPTIONS, function(err, resp) {
        assert.isNotNull(err);
        assert.equal(err, purse.INVALID_HTTP_CODES[404]);
        done();
      });
    });
  });
});
