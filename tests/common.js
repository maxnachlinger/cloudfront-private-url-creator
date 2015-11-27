'use strict';
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const common = exports;

const privateKeyPath = path.join(__dirname, 'private-key.pem');
let privateKey;

common.loadPrivateKey = function (loadPrivateKeyCb) {
  if (privateKey) {
    return loadPrivateKeyCb(null, privateKey);
  }

  fs.realpath(privateKeyPath, (err, resolvedPath) => {
    if (err) {
      return loadPrivateKeyCb(err);
    }

    fs.readFile(resolvedPath, (err, data) => {
      if (err) {
        return loadPrivateKeyCb(err);
      }
      privateKey = data;
      loadPrivateKeyCb(null, privateKey);
    });
  });
};

common.queryStringHasKeysValues = function (t, url, keysValues) {
  const queryStringKeysValues = querystring.parse(url.slice(url.indexOf('?') + 1));

  Object.keys(keysValues).forEach(key => {
    if (keysValues.hasOwnProperty(key)) {
      t.equal(keysValues[key], queryStringKeysValues[key], key + ' matches [' + queryStringKeysValues[key] + ']');
    }
  });
};
