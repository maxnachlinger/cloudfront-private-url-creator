var assert = require('assert');
var common = require('./common.js');
var cf = require('..');

/*
 Using example data and output from:
 http://docs.amazonwebservices.com/AmazonCloudFront/latest/DeveloperGuide/RestrictingAccessPrivateContent.html#CannedPolicy
 */
var urlToSign = 'http://d604721fxaaqy9.cloudfront.net/horizon.jpg?large=yes&license=yes';

var config = {
  privateKey:'',
  keyPairId:'PK12345EXAMPLE',
  dateLessThan:new Date(Date.parse('Sun, 1 Jan 2012 00:00:00 GMT'))
};

var expectedQueryString = {
  'Expires':1325376000, // unix-timestamp for Sun, 1 Jan 2012 00:00:00 GMT
  'Signature':'hO7oLKtCJQzsopeEB3nldOp2PvcVOoa9hdIhxP0y1tNUTEKVV3YhCFG-VCGZXDPbSQJnSoztS7j1w5s6GNorvgP4zG3P0WL9c5xBw0WwB8YHnmcvh8PYJ8nNm-CuHkCbuSkOCM2j87bglM1b1mb6XD6Jh4Ot9jb87NR9D1FSB6k_',
  'Key-Pair-Id':'PK12345EXAMPLE'
};

common.loadPrivateKey(function (err, key) {
  assert.ifError(err);
  config.privateKey = key;

  cf.signUrl(urlToSign, config, function signUrlCb(err, signedUrl) {
    assert.ifError(err);
    common.queryStringHasKeysValues(signedUrl, expectedQueryString);
  });
});
