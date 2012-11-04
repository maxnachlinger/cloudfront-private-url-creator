var crypto = require('crypto');
var querystring = require('querystring');
var _config, _url, policyType;

module.exports.signUrl = function (url, config, signCb) {
  _url = url;
  _config = config;
  policyType = 'canned';

  var argErrors = sanityCheckArgs();
  if (argErrors) return signCb(new Error(argErrors));

  var policy = JSON.stringify(buildPolicy());
  var signature = crypto.createSign('RSA-SHA1').update(policy).sign(_config.privateKey, 'base64');

  var query = {
    "Signature":sanitizeForUrl(signature),
    "Key-Pair-Id":_config.keyPairId
  };

  if (policyType === 'custom') {
    policy = new Buffer(policy, 'utf8').toString('base64');
    query["Policy"] = sanitizeForUrl(policy);
  } else {
    query["Expires"] = _config.dateLessThan;
  }

  var newUrl = _url + (_url.indexOf('?') === -1 ? '?' : '&') + querystring.stringify(query);
  signCb(null, newUrl);
};

function buildPolicy() {
  _config.dateLessThan = Math.round(_config.dateLessThan.getTime() / 1000);
  var condition = {
    "DateLessThan":{
      "AWS:EpochTime":_config.dateLessThan
    }
  };

  if (_config.dateGreaterThan) {
    policyType = 'custom';
    condition["DateGreaterThan"] = {
      "AWS:EpochTime":Math.round(_config.dateGreaterThan.getTime() / 1000)
    };
  }
  if (_config.ipAddress) {
    policyType = 'custom';
    condition["IpAddress"] = {
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

function sanityCheckArgs() {
  var errors = [];
  if (!_url) errors.push('Error: url parameter is required');
  if (!_config) {
    errors.push('Error: config parameter is required');
    return errors.join(', ');
  }

  ['privateKey', 'keyPairId', 'dateLessThan'].forEach(function (val) {
    if (typeof _config[val] === "undefined")
      errors.push('Error: config.' + val + ' is required');
  });

  ['dateLessThan', 'dateGreaterThan'].forEach(function (val) {
    if (_config[val] && Object.prototype.toString.call(_config[val]) !== '[object Date]')
      errors.push('Error: config.' + val + ' should be a Date object');
  });

  return errors.length > 0 ? errors.join(', ') : null;
}

function sanitizeForUrl(value) {
  return value.replace(/\+/g, '-').replace(/\=/g, '_').replace(/\//g, '~');
}
