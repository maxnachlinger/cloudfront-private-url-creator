var crypto = require('crypto');
var querystring = require('querystring');
var _config, _url;

module.exports.signUrl = function (url, config, signCb) {
  _url = url;
  _config = config;
  
  var argErrors = sanityCheckArgs();
  if (argErrors) return signCb(new Error(argErrors));

  var policy = buildPolicy();
  
  policy = JSON.stringify(policy);
  var signature = crypto.createSign('RSA-SHA1').update(policy).sign(_config.privateKey, 'base64');

  policy = new Buffer(policy, 'utf8').toString('base64');

  var query = {
    "Policy":sanitizeForUrl(policy),
    "Signature":sanitizeForUrl(signature),
    "Key-Pair-Id":_config.keyPairId
  };
  var newUrl = _url + '?' + querystring.stringify(query);
  signCb(null, newUrl);
};

function buildPolicy() {
  var condition = {
    "DateLessThan":{
      "AWS:EpochTime":Math.round(_config.dateLessThan.getTime() / 1000)
    }
  };
  
  if(_config.dateGreaterThan)
    condition["Statement"] = Math.round(_config.dateGreaterThan.getTime() / 1000)
  if(_config.ipAddress)
    condition["IpAddress"] = _config.ipAddress;

  return {
    "Statement":[{
      "Resource":_url,
      "Condition":condition
    }]
  };
}

function sanityCheckArgs() {
  var errors = [];
  if(!_url) errors.push('Error: url parameter is required');
  if(!_config) {
    errors.push('Error: config parameter is required');
    return errors.join(', ');
  }

  ['privateKey','keyPairId','dateLessThan'].forEach(function(val) {
    if(!_config[val]) 
    errors.push('Error: config.'+val+' is required');
  });
  
  ['dateLessThan','dateGreaterThan'].forEach(function(val) {
    if(_config[val] && Object.prototype.toString.call(_config[val]) !== '[object Date]') 
    errors.push('Error: config.'+val+' should be a Date object');
  });
  
  return errors.length > 0 ? errors.join(', ') : null;
}

function sanitizeForUrl(value) {
  return value.replace(/\+/g, '-').replace(/\=/g, '_').replace(/\//g, '~');
}
