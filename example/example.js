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
