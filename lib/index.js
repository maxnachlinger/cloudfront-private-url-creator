var crypto = require('crypto');
var querystring = require('querystring');
var _config, _url, policyType, privateKey;

module.exports.signUrl = function (url, config, signCb) {
  policyType = 'canned';

  var argErrors = sanityCheckArgs(url, config);
  if (argErrors) return signCb(new Error(argErrors));

  _url = url;
  privateKey = config.privateKey;
  // since config is a reference, this ensures we don't introduce some side-effect in the calling code
  _config = JSON.parse(JSON.stringify(config), function(key, value) {
    if(['dateLessThan', 'dateGreaterThan'].indexOf(key) !== -1)
      value = new Date(value).getTime();
    return value;
  });

  var policy = JSON.stringify(buildPolicy());
  var signature = crypto.createSign('RSA-SHA1').update(policy).sign(privateKey, 'base64');

  var query = {
    "Signature":sanitizeForUrl(signature),
    "Key-Pair-Id":_config.keyPairId
  };

  if (policyType === 'custom') {
    policy = new Buffer(policy, 'utf8').toString('base64');
    query.Policy = sanitizeForUrl(policy);
  } else {
    query.Expires = _config.dateLessThan;
  }

  var newUrl = _url + (_url.indexOf('?') === -1 ? '?' : '&') + querystring.stringify(query);
  signCb(null, newUrl);
};

function buildPolicy() {
  _config.dateLessThan = Math.round(_config.dateLessThan / 1000);
  var condition = {
    "DateLessThan":{
      "AWS:EpochTime":_config.dateLessThan
    }
  };

  if (_config.dateGreaterThan) {
    policyType = 'custom';
    condition.DateGreaterThan = {
      "AWS:EpochTime":Math.round(_config.dateGreaterThan / 1000)
    };
  }
  if (_config.ipAddress) {
    policyType = 'custom';
    condition.IpAddress = {
      "AWS:SourceIp":_config.ipAddress
    };
  }

  return {
    "Statement":[
      {
        "Resource":_url,
        "Condition":condition
      }
    ]
  };
}

function sanityCheckArgs(url, config) {
  var errors = [];
  if (!url) errors.push('Error: url parameter is required');
  if (!config) {
    errors.push('Error: config parameter is required');
    return errors.join(', ');
  }

  ['privateKey', 'keyPairId', 'dateLessThan'].forEach(function (val) {
    if (!config[val])
      errors.push('Error: config.' + val + ' is required');
  });

  ['dateLessThan', 'dateGreaterThan'].forEach(function (val) {
    if (!config[val]) return;
    if(['[object Date]','[object Number]'].indexOf(Object.prototype.toString.call(config[val])) === -1)
      errors.push('Error: config.' + val + ' should be a Date object or a Number');
  });

  return errors.length > 0 ? errors.join(', ') : null;
}

function sanitizeForUrl(value) {
  return value.replace(/\+/g, '-').replace(/\=/g, '_').replace(/\//g, '~');
}
