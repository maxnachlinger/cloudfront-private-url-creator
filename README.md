# cloudfront-private-url-creator

Creates and signs private Cloudfront Urls (``http:, https:, rtmp:, rtmpt:, rtmpe:, and rtmpte:``)

[![travis][travis-image]][travis-url]
[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]
[![standard][standard-image]][standard-url]

[travis-image]: https://travis-ci.org/maxnachlinger/cloudfront-private-url-creator.svg?branch=master
[travis-url]: https://travis-ci.org/maxnachlinger/cloudfront-private-url-creator
[npm-image]: https://img.shields.io/npm/v/cloudfront-private-url-creator.svg?style=flat
[npm-url]: https://npmjs.org/package/cloudfront-private-url-creator
[downloads-image]: https://img.shields.io/npm/dm/cloudfront-private-url-creator.svg?style=flat
[downloads-url]: https://npmjs.org/package/cloudfront-private-url-creator
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: http://standardjs.com/

### Installation:
```
npm i cloudfront-private-url-creator
```
### Note:
If you are using Node ``0.10 - 0.12``, please use version ``1.1.0``.

### Usage:
```javascript
'use strict'
const fs = require('fs')
const cf = require('cloudfront-private-url-creator')

const urlToSign = 'https://somedistro.cloudfront.net/somefolder/someFile'
const keyPairId = 'yourKeyPaidId'
const privateKeyPath = './yourKey.pem'

// date when the private url will expire (1 hour from now in this case)
const dateLessThan = new Date()
dateLessThan.setHours(dateLessThan.getHours() + 1)

const keyContents = fs.readFileSync(privateKeyPath)

const config = {
    privateKey: keyContents,
    keyPairId: keyPairId,
    dateLessThan: dateLessThan
}
// sign the url and return it, or just get the signature
const signatureQueryString = cf.getSignatureQueryString(urlToSign, config)
// OR
const signedUrl = cf.signUrl(urlToSign, config)
```
### Relevant AWS docs:
[Creating a Signed URL Using a Canned Policy](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-creating-signed-url-canned-policy.html)

[Creating a Signed URL Using a Custom Policy](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-creating-signed-url-custom-policy.html)

## Contributors
[Here's a list, thanks for your help!](https://github.com/maxnachlinger/cloudfront-private-url-creator/graphs/contributors)
