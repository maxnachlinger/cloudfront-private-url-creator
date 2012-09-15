var crypto = require('crypto');
var querystring = require('querystring');

module.exports.signUrl = function (url, config, signCb) {
  var expires = Math.round(config.expires.getTime() / 1000);

  var policy = {
    "Statement":[{
      "Resource":config.url,
      "Condition":{
        "DateLessThan":{
          "AWS:EpochTime":expires
        }
      }
    }]
  };
  
  policy = JSON.stringify(policy);
  var signature = crypto.createSign('RSA-SHA1').update(policy).sign(config.privateKey, 'base64');

  policy = new Buffer(policy, 'utf8').toString('base64');

  var query = {
    "Policy":sanitizeForUrl(policy),
    "Signature":sanitizeForUrl(signature),
    "Key-Pair-Id":config.keyPairId
  };
  var newUrl = url + '?' + querystring.stringify(query);
  signCb(null, newUrl);
};

function sanitizeForUrl(value) {
  return value.replace(/\+/g, '-').replace(/\=/g, '_').replace(/\//g, '~');
}
