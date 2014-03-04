'use strict';
var util = require('util');
var test = require('tape');
var common = require('./common.js');
var cf = require('..');

var privateKey;
var keyPairId = "PK12345EXAMPLE";
var distro = "testdistro.cloudfront.net";
var ipAddressToAllow = "10.0.0.1/32";

test('Setup', function (t) {
	common.loadPrivateKey(function (err, key) {
		t.notOk(err, "Loads test private key without error");
		t.ok(key, "Test private key is not empty");
		privateKey = key;
		t.end();
	});
});

test('A custom policy with a wildcard URL works', function (t) {
	var resource = util.format('https://%s/test/*', distro);

	var config = {
		privateKey: privateKey,
		keyPairId: keyPairId,
		dateLessThan: new Date(Date.parse('Thr, 1 Jan 2015 00:00:00 GMT')),
		ipAddress: ipAddressToAllow
	};

	var expectedQueryString = {
		'Policy': 'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly90ZXN0ZGlzdHJvLmNsb3VkZnJvbnQubmV0L3Rlc3QvKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTQyMDA3MDQwMH0sIklwQWRkcmVzcyI6eyJBV1M6U291cmNlSXAiOiIxMC4wLjAuMS8zMiJ9fX1dfQ__',
		'Signature': 'VY0hmU5wkB1a-KDWImjA~KriVkOIXlcWUYD4F0YZbMVSu-u8UaPUzc-jqyGTdeLi9qF6OHX0IPh2WphogcIVVA~8zTAeV8ceAo5uN5~-puxh0w8KaeBC2xK1qApO2TwxX1hKrS2-e0CJiwvsDZIPtFcABpEz9OJvmhz2WI1~h3A_',
		'Key-Pair-Id': keyPairId
	};

	t.test("signUrl test", function(t) {
		cf.signUrl(resource, config, function (err, signedUrl) {
			t.notOk(err, "Signs the URL without error, received: " + util.inspect(err));
			t.ok(signedUrl, "Signs the submitted resource, received: " + signedUrl);
			common.queryStringHasKeysValues(t, signedUrl, expectedQueryString);
			t.end();
		});
	});

	t.test("getSignatureQueryString test", function(t) {
		cf.getSignatureQueryString(resource, config, function (err, signature) {
			t.notOk(err, "Signs the URL without error, received: " + util.inspect(err));
			t.ok(signature, "Generates a signature for the submitted resource, received: " + signature);
			common.queryStringHasKeysValues(t, signature, expectedQueryString);
			t.end();
		});
	});
});

/*
 Using example data and output from:
 http://docs.amazonwebservices.com/AmazonCloudFront/latest/DeveloperGuide/RestrictingAccessPrivateContent.html#CannedPolicy
 */
test('A canned policy works', function (t) {
	var resource = util.format('https://%s/test/0.png', distro);

	var config = {
		privateKey: privateKey,
		keyPairId: keyPairId,
		dateLessThan: new Date(Date.parse('Thr, 1 Jan 2015 00:00:00 GMT'))
	};

	var expectedQueryString = {
		'Expires': (config.dateLessThan.getTime() / 1000).toString(),
		'Signature': 'ZQMqfsDGAFH4YJsm1GPzKdeHXlFm5~DugZcjJzpzSaI96tbehiCLW66OvORHdmXw1nK2UY8fBHNa6tvX~OeI7vxnO~ocf0BnhZKUvEd6QCFcyxUX~0kZtEZKEWtBNoJcRSMlLD3dTIA7aikiMpnr309Q4ugNFBPIzRgkg3CjXZA_',
		'Key-Pair-Id': keyPairId
	};

	t.test("signUrl test", function(t) {
		cf.signUrl(resource, config, function (err, signedUrl) {
			t.notOk(err, "Signs the URL without error, received: " + util.inspect(err));
			t.ok(signedUrl, "Signs the submitted resource, received: " + signedUrl);
			common.queryStringHasKeysValues(t, signedUrl, expectedQueryString);
			t.end();
		});
	});

	t.test("getSignatureQueryString test", function(t) {
		cf.getSignatureQueryString(resource, config, function (err, signature) {
			t.notOk(err, "Signs the URL without error, received: " + util.inspect(err));
			t.ok(signature, "Generates a signature for the submitted resource, received: " + signature);
			common.queryStringHasKeysValues(t, signature, expectedQueryString);
			t.end();
		});
	});
});

/*
 Using example data and output from:
 http://docs.amazonwebservices.com/AmazonCloudFront/latest/DeveloperGuide/RestrictingAccessPrivateContent.html#CustomPolicy
 */
test('A custom policy works', function (t) {
	var resource = util.format('https://%s/test/0.png', distro);

	var config = {
		privateKey: privateKey,
		keyPairId: keyPairId,
		dateLessThan: new Date(Date.parse('Thr, 1 Jan 2015 00:00:00 GMT')),
		ipAddress: ipAddressToAllow
	};

	var expectedQueryString = {
		'Policy': 'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly90ZXN0ZGlzdHJvLmNsb3VkZnJvbnQubmV0L3Rlc3QvMC5wbmciLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE0MjAwNzA0MDB9LCJJcEFkZHJlc3MiOnsiQVdTOlNvdXJjZUlwIjoiMTAuMC4wLjEvMzIifX19XX0_',
		'Signature': 'tM4OnxMRqJWCW5o0pKaZGEFBl3AMDtD8KKm0YcspsFucGDtzrgUmpHnA4V4kd0dXJOXI6uC6-erZp7PTgmNmDP3gVowN9tOmZCcfwbXqz1oRnbem0OqB-zuMiX1AUfYX5ubl7xAWjQCy6y504nTFfhIdszM62CEC5Y-L0VY4HHQ_',
		'Key-Pair-Id': keyPairId
	};

	t.test("signUrl test", function(t) {
		cf.signUrl(resource, config, function (err, signedUrl) {
			t.notOk(err, "Signs the URL without error, received: " + util.inspect(err));
			t.ok(signedUrl, "Signs the submitted resource, received: " + signedUrl);
			common.queryStringHasKeysValues(t, signedUrl, expectedQueryString);
			t.end();
		});
	});

	t.test("getSignatureQueryString test", function(t) {
		cf.getSignatureQueryString(resource, config, function (err, signature) {
			t.notOk(err, "Signs the URL without error, received: " + util.inspect(err));
			t.ok(signature, "Generates a signature for the submitted resource, received: " + signature);
			common.queryStringHasKeysValues(t, signature, expectedQueryString);
			t.end();
		});
	});
});

test('An RTMP url works', function (t) {
	var resource = util.format('rtmp://%s/cfx/st/0.mp4', distro);

	var config = {
		privateKey: privateKey,
		keyPairId: keyPairId,
		dateLessThan: new Date(Date.parse('Thr, 1 Jan 2015 00:00:00 GMT'))
	};

	var expectedQueryString = {
		'Expires': (config.dateLessThan.getTime() / 1000).toString(),
		'Signature': 'ZeZh3GJnsgcD4t2Q~MJsYvtVOVazckQxn~cOXCDCxy0eWVcEt~PsyOla1zb8m1j8Ju1IptF5l2L0HWznFgo8V40ziwrKCdp5jpbJ5kFEZB2tNwbf-1brpM6LJVNpfm0B2xnvV~SIDWJQVIQ3d0KzzvGqNyf7260remqZWegzgrc_',
		'Key-Pair-Id': keyPairId
	};

	t.test("signUrl test", function(t) {
		cf.signUrl(resource, config, function (err, signedUrl) {
			t.notOk(err, "Signs the URL without error, received: " + util.inspect(err));
			t.ok(signedUrl, "Signs the submitted resource, received: " + signedUrl);
			t.ok(~signedUrl.indexOf(resource), "Preserves original URL");
			common.queryStringHasKeysValues(t, signedUrl, expectedQueryString);
			t.end();
		});
	});

	t.test("getSignatureQueryString test", function(t) {
		cf.getSignatureQueryString(resource, config, function (err, signature) {
			t.notOk(err, "Signs the URL without error, received: " + util.inspect(err));
			t.ok(signature, "Signs the submitted resource, received: " + signature);
			common.queryStringHasKeysValues(t, signature, expectedQueryString);
			t.end();
		});
	});
});
