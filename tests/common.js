var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var assert = require('assert');

var common = exports;

var privateKeyPath = path.join(__dirname, 'private-key.pem');
var privateKey;

common.loadPrivateKey = function(loadPrivateKeyCb) {
  if(privateKey) return loadPrivateKeyCb(null,privateKey);

  fs.realpath(privateKeyPath, function (err, resolvedPath) {
    if (err) return loadPrivateKeyCb(err);

    fs.readFile(resolvedPath, function (err, data) {
      if (err) return loadPrivateKeyCb(err);
      privateKey = data;
      loadPrivateKeyCb(null, privateKey);
    });
  });
};

common.queryStringHasKeysValues = function(url, keysValues) {
  var queryStringKeysValues = querystring.parse(url.slice(url.indexOf('?')+1));
  for(var key in keysValues) {
    assert.equal(keysValues.key, queryStringKeysValues.key);
  }
};
