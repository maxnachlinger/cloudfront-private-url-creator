#cloudfront-private-url-creator

Creates and signs private Cloudfront Urls.

[![Build Status](https://travis-ci.org/maxnachlinger/cloudfront-private-url-creator.png?branch=master)](https://travis-ci.org/maxnachlinger/cloudfront-private-url-creator)

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
## License

(The MIT License)

Copyright (c) 2012-2013 Max Nachlinger

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
