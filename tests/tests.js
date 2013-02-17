var test = require('tap').test;
var common = require('./common.js');
var cf = require('..');

/*
 Using example data and output from:
 http://docs.amazonwebservices.com/AmazonCloudFront/latest/DeveloperGuide/RestrictingAccessPrivateContent.html#CannedPolicy
 */
test('Canned policy works', function (t) {
	var urlToSign = 'http://d604721fxaaqy9.cloudfront.net/horizon.jpg?large=yes&license=yes';

	var config = {
		privateKey: '',
		keyPairId: 'PK12345EXAMPLE',
		dateLessThan: new Date(Date.parse('Sun, 1 Jan 2012 00:00:00 GMT'))
	};

	var expectedQueryString = {
		'Expires': 1325376000, // unix-timestamp for Sun, 1 Jan 2012 00:00:00 GMT
		'Signature': 'hO7oLKtCJQzsopeEB3nldOp2PvcVOoa9hdIhxP0y1tNUTEKVV3YhCFG-VCGZXDPbSQJnSoztS7j1w5s6GNorvgP4zG3P0WL9c5xBw0WwB8YHnmcvh8PYJ8nNm-CuHkCbuSkOCM2j87bglM1b1mb6XD6Jh4Ot9jb87NR9D1FSB6k_',
		'Key-Pair-Id': 'PK12345EXAMPLE'
	};

	common.loadPrivateKey(function (err, key) {
		t.notOk(err, "Loads test private key");
		config.privateKey = key;

		cf.signUrl(urlToSign, config, function signUrlCb(err, signedUrl) {
			t.notOk(err, "Signs the URL");
			t.ok(common.queryStringHasKeysValues(signedUrl, expectedQueryString),"URL is signed as expected");
			t.end();
		});
	});
});

/*
 Using example data and output from:
 http://docs.amazonwebservices.com/AmazonCloudFront/latest/DeveloperGuide/RestrictingAccessPrivateContent.html#CustomPolicy
 */
test('Custom policy works', function (t) {
	var urlToSign = 'http://d604721fxaaqy9.cloudfront.net/training/orientation.avi';

	var config = {
		privateKey: '',
		keyPairId: 'PK12345EXAMPLE',
		dateLessThan: new Date(Date.parse('Sun, 1 Jan 2012 00:00:00 GMT')),
		ipAddress: '145.168.143.0/24'
	};

	var expectedQueryString = {
		'Policy': 'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cDovL2Q2MDQ3MjFmeGFhcXk5LmNsb3VkZnJvbnQubmV0L3RyYWluaW5nL29yaWVudGF0aW9uLmF2aSIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTMyNTM3NjAwMH0sIklwQWRkcmVzcyI6eyJBV1M6U291cmNlSXAiOiIxNDUuMTY4LjE0My4wLzI0In19fV19',
		'Signature': 'vyilVAeUjgvmmYIQGv8pWWgeGr55RzYh-gv8GiwFuBiHhnYftLSFy11i71RNbBmhcMddFE0Jq5KSnQtCgBwydeHYvMPcqak9cO8ScFnAkGi5y3wf3RcJkBNsvKqMlrVsRkts1rB82ScsaMTYbRQEUY3AB2K0SkuXCZ~6gvCQI98_',
		'Key-Pair-Id': 'PK12345EXAMPLE'
	};

	common.loadPrivateKey(function (err, key) {
		t.notOk(err, "Loads test private key");
		config.privateKey = key;

		cf.signUrl(urlToSign, config, function signUrlCb(err, signedUrl) {
			t.notOk(err, "Signs the URL");
			t.ok(common.queryStringHasKeysValues(signedUrl, expectedQueryString),"URL is signed as expected");
			t.end();
		});
	});
});
