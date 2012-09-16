var crypto = require('crypto');
var querystring = require('querystring');

module.exports.signUrl = function (url, config, signCb) {
  var argErrors = sanityCheckArgs(url, config);
  if (argErrors) return signCb(new Error(argErrors));

  var expires = Math.round(config.expires.getTime() / 1000);

  var policy = {
    "Statement":[{
      "Resource":url,
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

function sanityCheckArgs(url, config) {
  var errors = [];
  if(!url) errors.push('Error: url parameter is required');
  if(!config) {
    errors.push('Error: config parameter is required');
    return errors.join(', ');
  }

  ['privateKey','keyPairId','expires'].forEach(function(val) {
    if(!config[val]) errors.push('Error: config.'+val+' is required');
  });

  if (config.expires && Object.prototype.toString.call(config.expires) !== '[object Date]')
    errors.push('Error: config.expires should be a Date object');

  return errors.length > 0 ? errors.join(', ') : null;
}

function sanitizeForUrl(value) {
  return value.replace(/\+/g, '-').replace(/\=/g, '_').replace(/\//g, '~');
}
