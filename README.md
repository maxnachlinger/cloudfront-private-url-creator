#cloudfront-private-url-creator

Creates and signs private Cloudfront Urls.

## Installation:
```npm install git+ssh://git@github.com:Mindflash/cloudfront-private-url-creator.git```

## Usage:
```javascript
var fs = require('fs');
var cf = require('cloudfront-private-url-creator');

var urlToSign = 'https://somedistro.cloudfront.net/somefolder/someFile';

// expires in 3 years
var expires = new Date();
expires.setYear(expires.getFullYear()+3);

var keyPairId = 'yourKeyPaidId';
var privateKeyPath = './yourKey.pem';

loadPrivateKey(function(err,result) {
  if(err) return;
  var config = {
		privateKey: result,
		keyPairId: keyPairId,
		expires: expires
	};
  
	// signs the url
	cf.signUrl(urlToSign, config, function signUrlCb(err,result) {
		console.log(result);
	});
});

// read the private pem key file into memory
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