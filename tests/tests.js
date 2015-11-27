'use strict';
const util = require('util');
const test = require('tape');
const common = require('./common.js');
const cf = require('..');

let privateKey;
const keyPairId = 'PK12345EXAMPLE';
const distro = 'testdistro.cloudfront.net';
const ipAddressToAllow = '10.0.0.1/32';

test('Setup', t => {
  common.loadPrivateKey((err, key) => {
    t.notOk(err, 'Loads test private key without error');
    t.ok(key, 'Test private key is not empty');
    privateKey = key;
    t.end();
  });
});

test('A custom policy with a wildcard URL works', t => {
  const resource = util.format('https://%s/test/*', distro);

  const config = {
    privateKey: privateKey,
    keyPairId: keyPairId,
    dateLessThan: new Date(Date.parse('Thr, 1 Jan 2015 00:00:00 GMT')),
    ipAddress: ipAddressToAllow
  };

  const expectedQueryString = {
    'Policy': 'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly90ZXN0ZGlzdHJvLmNsb3VkZnJvbnQubmV0L3Rlc3QvKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTQyMDA3MDQwMH0sIklwQWRkcmVzcyI6eyJBV1M6U291cmNlSXAiOiIxMC4wLjAuMS8zMiJ9fX1dfQ__',
    'Signature': 'VY0hmU5wkB1a-KDWImjA~KriVkOIXlcWUYD4F0YZbMVSu-u8UaPUzc-jqyGTdeLi9qF6OHX0IPh2WphogcIVVA~8zTAeV8ceAo5uN5~-puxh0w8KaeBC2xK1qApO2TwxX1hKrS2-e0CJiwvsDZIPtFcABpEz9OJvmhz2WI1~h3A_',
    'Key-Pair-Id': keyPairId
  };

  t.test('signUrl test', t => {
    console.time('signUrl test');
    cf.signUrl(resource, config, (err, signedUrl) => {
      console.timeEnd('signUrl test');
      t.notOk(err, 'Signs the URL without error, received: ' + (err || {}).stack);
      t.ok(signedUrl, 'Signs the submitted resource, received: ' + signedUrl);
      common.queryStringHasKeysValues(t, signedUrl, expectedQueryString);
      t.end();
    });
  });

  t.test('getSignatureQueryString test', t => {
    console.time('getSignatureQueryString test');
    cf.getSignatureQueryString(resource, config, (err, signature) => {
      console.timeEnd('getSignatureQueryString test');
      t.notOk(err, 'Signs the URL without error, received: ' + (err || {}).stack);
      t.ok(signature, 'Generates a signature for the submitted resource, received: ' + signature);
      common.queryStringHasKeysValues(t, signature, expectedQueryString);
      t.end();
    });
  });
});

test('A custom policy with a wildcard URL works', t => {
  const resource = util.format('https://%s/test/*', distro);

  const config = {
    privateKey: privateKey,
    keyPairId: keyPairId,
    dateLessThan: new Date(Date.parse('Thr, 1 Jan 2015 00:00:00 GMT')),
    ipAddress: ipAddressToAllow
  };

  const expectedQueryString = {
    'Policy': 'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly90ZXN0ZGlzdHJvLmNsb3VkZnJvbnQubmV0L3Rlc3QvKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTQyMDA3MDQwMH0sIklwQWRkcmVzcyI6eyJBV1M6U291cmNlSXAiOiIxMC4wLjAuMS8zMiJ9fX1dfQ__',
    'Signature': 'VY0hmU5wkB1a-KDWImjA~KriVkOIXlcWUYD4F0YZbMVSu-u8UaPUzc-jqyGTdeLi9qF6OHX0IPh2WphogcIVVA~8zTAeV8ceAo5uN5~-puxh0w8KaeBC2xK1qApO2TwxX1hKrS2-e0CJiwvsDZIPtFcABpEz9OJvmhz2WI1~h3A_',
    'Key-Pair-Id': keyPairId
  };

  t.test('signUrl test', t => {
    console.time('signUrl test');
    cf.signUrl(resource, config, (err, signedUrl) => {
      console.timeEnd('signUrl test');
      t.notOk(err, 'Signs the URL without error, received: ' + (err || {}).stack);
      t.ok(signedUrl, 'Signs the submitted resource, received: ' + signedUrl);
      common.queryStringHasKeysValues(t, signedUrl, expectedQueryString);
      t.end();
    });
  });

  t.test('getSignatureQueryString test', t => {
    console.time('getSignatureQueryString test');
    cf.getSignatureQueryString(resource, config, (err, signature) => {
      console.timeEnd('getSignatureQueryString test');
      t.notOk(err, 'Signs the URL without error, received: ' + (err || {}).stack);
      t.ok(signature, 'Generates a signature for the submitted resource, received: ' + signature);
      common.queryStringHasKeysValues(t, signature, expectedQueryString);
      t.end();
    });
  });
});

/*
 Using example data and output from:
 http://docs.amazonwebservices.com/AmazonCloudFront/latest/DeveloperGuide/RestrictingAccessPrivateContent.html#CannedPolicy
 */
test('A canned policy works', t => {
  const resource = util.format('https://%s/test/0.png', distro);

  const config = {
    privateKey: privateKey,
    keyPairId: keyPairId,
    dateLessThan: new Date(Date.parse('Thr, 1 Jan 2015 00:00:00 GMT'))
  };

  const expectedQueryString = {
    'Expires': (config.dateLessThan.getTime() / 1000).toString(),
    'Signature': 'ZQMqfsDGAFH4YJsm1GPzKdeHXlFm5~DugZcjJzpzSaI96tbehiCLW66OvORHdmXw1nK2UY8fBHNa6tvX~OeI7vxnO~ocf0BnhZKUvEd6QCFcyxUX~0kZtEZKEWtBNoJcRSMlLD3dTIA7aikiMpnr309Q4ugNFBPIzRgkg3CjXZA_',
    'Key-Pair-Id': keyPairId
  };

  t.test('signUrl test', t => {
    console.time('signUrl test');
    cf.signUrl(resource, config, (err, signedUrl) => {
      console.timeEnd('signUrl test');
      t.notOk(err, 'Signs the URL without error, received: ' + (err || {}).stack);
      t.ok(signedUrl, 'Signs the submitted resource, received: ' + signedUrl);
      common.queryStringHasKeysValues(t, signedUrl, expectedQueryString);
      t.end();
    });
  });

  t.test('getSignatureQueryString test', t => {
    console.time('getSignatureQueryString test');
    cf.getSignatureQueryString(resource, config, (err, signature) => {
      console.timeEnd('getSignatureQueryString test');
      t.notOk(err, 'Signs the URL without error, received: ' + (err || {}).stack);
      t.ok(signature, 'Generates a signature for the submitted resource, received: ' + signature);
      common.queryStringHasKeysValues(t, signature, expectedQueryString);
      t.end();
    });
  });
});

/*
 Using example data and output from:
 http://docs.amazonwebservices.com/AmazonCloudFront/latest/DeveloperGuide/RestrictingAccessPrivateContent.html#CustomPolicy
 */
test('A custom policy works', t => {
  const resource = util.format('https://%s/test/0.png', distro);

  const config = {
    privateKey: privateKey,
    keyPairId: keyPairId,
    dateLessThan: new Date(Date.parse('Thr, 1 Jan 2015 00:00:00 GMT')),
    ipAddress: ipAddressToAllow
  };

  const expectedQueryString = {
    'Policy': 'eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly90ZXN0ZGlzdHJvLmNsb3VkZnJvbnQubmV0L3Rlc3QvMC5wbmciLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE0MjAwNzA0MDB9LCJJcEFkZHJlc3MiOnsiQVdTOlNvdXJjZUlwIjoiMTAuMC4wLjEvMzIifX19XX0_',
    'Signature': 'tM4OnxMRqJWCW5o0pKaZGEFBl3AMDtD8KKm0YcspsFucGDtzrgUmpHnA4V4kd0dXJOXI6uC6-erZp7PTgmNmDP3gVowN9tOmZCcfwbXqz1oRnbem0OqB-zuMiX1AUfYX5ubl7xAWjQCy6y504nTFfhIdszM62CEC5Y-L0VY4HHQ_',
    'Key-Pair-Id': keyPairId
  };

  t.test('signUrl test', t => {
    console.time('signUrl test');
    cf.signUrl(resource, config, (err, signedUrl) => {
      console.timeEnd('signUrl test');
      t.notOk(err, 'Signs the URL without error, received: ' + (err || {}).stack);
      t.ok(signedUrl, 'Signs the submitted resource, received: ' + signedUrl);
      common.queryStringHasKeysValues(t, signedUrl, expectedQueryString);
      t.end();
    });
  });

  t.test('getSignatureQueryString test', t => {
    console.time('getSignatureQueryString test');
    cf.getSignatureQueryString(resource, config, (err, signature) => {
      console.timeEnd('getSignatureQueryString test');
      t.notOk(err, 'Signs the URL without error, received: ' + (err || {}).stack);
      t.ok(signature, 'Generates a signature for the submitted resource, received: ' + signature);
      common.queryStringHasKeysValues(t, signature, expectedQueryString);
      t.end();
    });
  });
});

test('An RTMP url works', t => {
  const resource = util.format('rtmp://%s/cfx/st/0.mp4', distro);

  const config = {
    privateKey: privateKey,
    keyPairId: keyPairId,
    dateLessThan: new Date(Date.parse('Thr, 1 Jan 2015 00:00:00 GMT'))
  };

  const expectedQueryString = {
    'Expires': (config.dateLessThan.getTime() / 1000).toString(),
    'Signature': 'ZeZh3GJnsgcD4t2Q~MJsYvtVOVazckQxn~cOXCDCxy0eWVcEt~PsyOla1zb8m1j8Ju1IptF5l2L0HWznFgo8V40ziwrKCdp5jpbJ5kFEZB2tNwbf-1brpM6LJVNpfm0B2xnvV~SIDWJQVIQ3d0KzzvGqNyf7260remqZWegzgrc_',
    'Key-Pair-Id': keyPairId
  };

  t.test('signUrl test', t => {
    console.time('signUrl test');
    cf.signUrl(resource, config, (err, signedUrl) => {
      console.timeEnd('signUrl test');
      t.notOk(err, 'Signs the URL without error, received: ' + (err || {}).stack);
      t.ok(signedUrl, 'Signs the submitted resource, received: ' + signedUrl);
      t.ok(~signedUrl.indexOf(resource), 'Preserves original URL');
      common.queryStringHasKeysValues(t, signedUrl, expectedQueryString);
      t.end();
    });
  });

  t.test('getSignatureQueryString test', t => {
    console.time('getSignatureQueryString test');
    cf.getSignatureQueryString(resource, config, (err, signature) => {
      console.timeEnd('getSignatureQueryString test');
      t.notOk(err, 'Signs the URL without error, received: ' + (err || {}).stack);
      t.ok(signature, 'Signs the submitted resource, received: ' + signature);
      common.queryStringHasKeysValues(t, signature, expectedQueryString);
      t.end();
    });
  });
});
