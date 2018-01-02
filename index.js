var request = require('superagent');
var _ = require('underscore');


var Purse = function(options) {
  this.options = options;
  this.INVALID_HTTP_CODES = Purse.INVALID_HTTP_CODES;
};

Purse.INVALID_HTTP_CODES = {
  400: "Insufficient balance/credit limit reached.",
  404: "Wallet doesn't exists.",
  500: "Failed to complete transaction."
};

/**
 * options:
 *   wallet_id
 *   amount
 */
Purse.prototype.reserve = function(options, cb) {
  if (!this._checkParameters(['wallet_id', 'amount'], options)) {
    return cb("Missing parameters!", null);
  }

  this._request({
    method: 'reserve',
    data: options,
    wallet_id: options.wallet_id
  }, cb);
};

/**
 * options:
 *   wallet_id
 *   amount
 */
Purse.prototype.charge = function(options, cb) {
  if(!this._checkParameters(['wallet_id', 'amount'], options)) {
    return cb("Missing parameters!", null);
  }

  this._request({
    method: 'charge',
    data: options,
    wallet_id: options.wallet_id
  }, cb);
};

/**
 * options:
 *   wallet_id
 *   reference_id
 */
Purse.prototype.complete = function(options, cb) {
  if (!this._checkParameters(['wallet_id', 'reference_id'], options)) {
    return cb("Missing parameters!", null);
  }

  this._request({
    method: 'complete',
    data: options,
    wallet_id: options.wallet_id
  }, cb);
};

/**
 * options:
 *   wallet_id
 *   reference_id
 */
Purse.prototype.cancel = function(options, cb) {
  if (!this._checkParameters(['wallet_id', 'reference_id'], options)) {
    return cb("Missing parameters!", null);
  }

  this._request({
    method: 'cancel',
    data: options,
    wallet_id: options.wallet_id
  }, cb);
};

/**
 * options:
 *   wallet_id
 *   method
 *   data
 */
Purse.prototype._request = function(options, cb) {
  var url = this.options.url + '/wallets/' + options.wallet_id + '/' + options.method;
  var self = this;
  request
    .post(url)
    .type('json')
    .send(options.data)
    .end(function(err, resp) {
      if (err) {
        return cb("System is down!", null);
      }
      if (self.INVALID_HTTP_CODES[resp.statusCode]) {
        return cb(self.INVALID_HTTP_CODES[resp.statusCode], null);
      }
      return cb(null, {
        statusCode: resp.statusCode,
        body: resp.body
      });
    });
};

Purse.prototype._checkParameters = function(parameters, options) {
  // Check if some parameters are missing
  var x =  _.all(parameters, function(i) {
    return _.include(_.keys(options), i);
  });

  if (!x) {
    return false; 
  }

  return true;
};


module.exports = Purse;
