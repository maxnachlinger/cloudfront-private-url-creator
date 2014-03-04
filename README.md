#cloudfront-private-url-creator

Creates and signs private Cloudfront Urls (http:, https:, and rtmp:)

[![Build Status](https://travis-ci.org/maxnachlinger/cloudfront-private-url-creator.png?branch=master)](https://travis-ci.org/maxnachlinger/cloudfront-private-url-creator)

### Installation:
```
npm install cloudfront-private-url-creator
```
### Usage:
```javascript
"use strict";
var fs = require('fs');
var cf = require('..');

var urlToSign = 'https://somedistro.cloudfront.net/somefolder/someFile';
var keyPairId = 'yourKeyPaidId';
var privateKeyPath = './yourKey.pem';

// date when the private url will expire (1 hour from now in this case)
var dateLessThan = new Date();
dateLessThan.setHours(dateLessThan.getHours() + 1);

loadPrivateKey(function privateKeyCb(err, keyContents) {
  if (err) {
    console.error(err);
    return;
  }
  var config = {
    privateKey: keyContents,
    keyPairId: keyPairId,
    dateLessThan: dateLessThan
  };
  // sign the url and return it, or just get the signature
  var signatureQueryString = cf.getSignatureQueryString(urlToSign, config);
  // OR
  var signedUrl = cf.signUrl(urlToSign, config);
});

function loadPrivateKey(cb) {
  fs.realpath(privateKeyPath, function (err, resolvedPath) {
    if (err) {
      return cb(err);
    }

    fs.readFile(resolvedPath, function (err, data) {
      if (err) {
        return cb(err);
      }
      cb(null, data);
    });
  });
}
```
### Relevant AWS docs:
[Creating a Signed URL Using a Canned Policy](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-creating-signed-url-canned-policy.html)

[Creating a Signed URL Using a Custom Policy](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-creating-signed-url-custom-policy.html)
### License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2013 Max Nachlinger
