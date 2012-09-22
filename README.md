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

// date when the private url will expire (1 hour from now in this case)
var dateLessThan = new Date();
dateLessThan.setHours(dateLessThan.getHours()+1);

var keyPairId = 'yourKeyPaidId';
var privateKeyPath = './yourKey.pem';

loadPrivateKey(function privateKeyCb(err,keyContents) {
  if(err) {
    console.error(err);
    return;
  }
  var config = {
    privateKey: keyContents,
    keyPairId: keyPairId,
    dateLessThan: dateLessThan
  };
  cf.signUrl(urlToSign, config, function signUrlCb(err,signedUrl) {
    if(err) {
      console.error(err);
      return;
    }
    console.log(signedUrl);
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
```
