var fs = require('fs');
var path = require('path');

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
