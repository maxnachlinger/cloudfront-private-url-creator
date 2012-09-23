var assert = require('assert');
var common = require('./common.js');
var cf = require('..');

var test = exports;
/*
 Using example data and output from:
 http://docs.amazonwebservices.com/AmazonCloudFront/latest/DeveloperGuide/RestrictingAccessPrivateContent.html#CustomPolicy
 */
var urlToSign = 'http://d604721fxaaqy9.cloudfront.net/training/orientation.avi';

var config = {
  privateKey:'',
  keyPairId:'PK12345EXAMPLE',
  dateLessThan:new Date(Date.parse('Sun, 1 Jan 2012 00:00:00 GMT')),
  ipAddress:'145.168.143.0/24'
};

var expectedQueryString = {
  'Policy':'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cDovL2Q2MDQ3MjFmeGFhcXk5LmNsb3VkZnJvbnQubmV0L3RyYWluaW5nL29yaWVudGF0aW9uLmF2aSIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTMyNTM3NjAwMH0sIklwQWRkcmVzcyI6eyJBV1M6U291cmNlSXAiOiIxNDUuMTY4LjE0My4wLzI0In19fV19',
  'Signature':'vyilVAeUjgvmmYIQGv8pWWgeGr55RzYh-gv8GiwFuBiHhnYftLSFy11i71RNbBmhcMddFE0Jq5KSnQtCgBwydeHYvMPcqak9cO8ScFnAkGi5y3wf3RcJkBNsvKqMlrVsRkts1rB82ScsaMTYbRQEUY3AB2K0SkuXCZ~6gvCQI98_',
  'Key-Pair-Id':'PK12345EXAMPLE'
};

test.run = function(testCb) {
  common.loadPrivateKey(function (err, key) {
    assert.ifError(err);
    config.privateKey = key;

    cf.signUrl(urlToSign, config, function signUrlCb(err, signedUrl) {
      assert.ifError(err);
      common.queryStringHasKeysValues(signedUrl, expectedQueryString);
    });
  });
};