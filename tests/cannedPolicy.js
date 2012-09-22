var fs = require('fs');
var assert = require('assert');
var querystring = require('querystring');
var cf = require('..');

/*
Using example data and output from:
 http://docs.amazonwebservices.com/AmazonCloudFront/latest/DeveloperGuide/RestrictingAccessPrivateContent.html#CannedPolicy
*/
var urlToSign = 'http://d604721fxaaqy9.cloudfront.net/horizon.jpg?large=yes&license=yes';
var privateKeyPath = 'tests/private-key.pem';

var config = {
  privateKey:'',
  keyPairId:'PK12345EXAMPLE',
  dateLessThan:new Date(Date.parse("Sun, 1 Jan 2012 00:00:00 GMT"))
};

var expectedPolicy = 'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cDovL2Q2MDQ3MjFmeGFhcXk5LmNsb3VkZnJvbnQubmV0L2hvcml6b24uanBnP2xhcmdlPXllcyZsaWNlbnNlPXllcyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTMyNTM3NjAwMH19fV19';
var expectedSignature = 'hO7oLKtCJQzsopeEB3nldOp2PvcVOoa9hdIhxP0y1tNUTEKVV3YhCFG-VCGZXDPbSQJnSoztS7j1w5s6GNorvgP4zG3P0WL9c5xBw0WwB8YHnmcvh8PYJ8nNm-CuHkCbuSkOCM2j87bglM1b1mb6XD6Jh4Ot9jb87NR9D1FSB6k_';
var expectedKeyPairId = 'PK12345EXAMPLE';

loadPrivateKey(function privateKeyCb(err, keyContents) {
  assert.ifError(err);

  config.privateKey = keyContents;

  cf.signUrl(urlToSign, config, function signUrlCb(err, signedUrl) {
    assert.ifError(err);

    var queryStringValues = querystring.parse(signedUrl);
    assert.equal(expectedPolicy, queryStringValues['Policy']);
    assert.equal(expectedSignature, queryStringValues['Signature']);
    assert.equal(expectedKeyPairId, queryStringValues['Key-Pair-Id']);
  });
});

function loadPrivateKey(cb) {
  fs.realpath(privateKeyPath, function (err, resolvedPath) {
    if (err) return cb(err);

    fs.readFile(resolvedPath, function (err, data) {
      if (err) return cb(err);
      cb(null, data);
    });
  });
}