#cloudfront-private-url-creator

Creates and signs private Cloudfront Urls.

## Installation:
```
npm install cloudfront-private-url-creator
```

## Usage:
```javascript

var fs = require('fs');
var cf = require('cloudfront-private-url-creator');

var urlToSign = 'https://somedistro.cloudfront.net/somefolder/someFile';

// date when the private url will expire
var expires = new Date();
expires.setYear(expires.getFullYear()+1);

var keyPairId = 'yourKeyPaidId';
var privateKeyPath = './yourKey.pem';

loadPrivateKey(function privateKeyCb(err,key) {
  if(err) {
    console.error(err);
    return;
  }
  var config = {
    privateKey: key,
    keyPairId: keyPairId,
    expires: expires
  };
  cf.signUrl(url, config, function signUrlCb(err,signedUrl) {
    if(err) {
      console.error(err);
      return;
    }
    console.log(signedUrl);
  });
});

function loadPrivateKey(cb) {
  fs.realpath(privateKeyPath, function (err, resolvedPath) {
    if (err) cb(err);

    fs.readFile(resolvedPath, function (err, data) {
      if (err) cb(err);
      cb(null, data);
    });
  });
}

```