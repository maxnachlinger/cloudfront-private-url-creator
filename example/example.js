'use strict'
const fs = require('fs')
const cf = require('cloudfront-private-url-creator')

const urlToSign = 'https://somedistro.cloudfront.net/somefolder/someFile'
const keyPairId = 'yourKeyPaidId'
const privateKeyPath = './yourKey.pem'

// date when the private url will expire (1 hour from now in this case)
const dateLessThan = new Date()
dateLessThan.setHours(dateLessThan.getHours() + 1)

loadPrivateKey((err, keyContents) => {
  if (err) {
    console.error(err)
    return
  }
  const config = {
    privateKey: keyContents,
    keyPairId: keyPairId,
    dateLessThan: dateLessThan
  }
  // sign the url and return it, or just get the signature
  cf.getSignatureQueryString(urlToSign, config)
  // OR
  cf.signUrl(urlToSign, config)
})

function loadPrivateKey(cb) {
  fs.realpath(privateKeyPath, (err, resolvedPath) => {
    if (err) {
      return cb(err)
    }

    fs.readFile(resolvedPath, (err, data) => {
      if (err) {
        return cb(err)
      }
      cb(null, data)
    })
  })
}
