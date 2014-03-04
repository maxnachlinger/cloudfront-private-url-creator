'use strict';
var crypto = require('crypto');
var querystring = require('querystring');
var url = require('url');

module.exports = function () {
	function signUrl(resource, config, signCb) {
		var signatureQueryString = getSignatureQueryString(resource, config);
		var resourceInfo = getResourceInfo(resource);

		var url = resourceInfo.protocol + '//' + resourceInfo.host + resourceInfo.path +
			(~resourceInfo.path.indexOf('?') ? '&' : '?') + signatureQueryString;

		if(!signCb) {
			return url;
		}
		process.nextTick(function () {
			signCb(null, url);
		});
	}

	function getSignatureQueryString(resource, config, signCb) {
		var argErrors = sanityCheckArgs(resource, config);
		if (argErrors) {
			if(!signCb) {
				throw new Error(argErrors);
			}
			return process.nextTick(function () {
				signCb(new Error(argErrors));
			});
		}

		var resourceInfo = getResourceInfo(resource);

		// since config is a reference, this ensures we don't introduce some side-effect in the calling code
		var policy = buildPolicy(JSON.parse(JSON.stringify(config), function (key, value) {
			if (~['dateLessThan', 'dateGreaterThan'].indexOf(key)) {
				value = new Date(value).getTime();
			}
			return value;
		}), resourceInfo.resource);
		var policyString = JSON.stringify(policy);

		var query = {
			"Signature": sanitizeForUrl(crypto.createSign('RSA-SHA1').update(policyString).sign(config.privateKey, 'base64')),
			"Key-Pair-Id": config.keyPairId
		};

		var policyType = getPolicyType(policy);

		if (policyType === 'custom') {
			query.Policy = sanitizeForUrl(new Buffer(policyString, 'utf8').toString('base64'));
		} else {
			query.Expires = policy.Statement[0].Condition.DateLessThan['AWS:EpochTime'];
		}

		var signature = querystring.stringify(query);
		if(!signCb) {
			return signature;
		}
		process.nextTick(function () {
			signCb(null, signature);
		});
	}

	function sanityCheckArgs(resource, config) {
		var errors = [];
		var validProtocols = ['http:', 'https:', 'rtmp:'];

		if (!resource) {
			errors.push('Error: resource parameter is required');
		}

		if (!config) {
			errors.push('Error: config parameter is required');
			return errors.join(', ');
		}

		if (!~validProtocols.indexOf(url.parse(resource).protocol)) {
			errors.push('Error: invalid resource protocol, resource should begin with: ' + validProtocols.join(', '));
			return errors.join(', ');
		}

		['privateKey', 'keyPairId', 'dateLessThan'].forEach(function (val) {
			if (typeof config[val] === "undefined") {
				errors.push('Error: config.' + val + ' is required');
			}
		});

		['dateLessThan', 'dateGreaterThan'].forEach(function (val) {
			if (!config[val]) {
				return;
			}
			if (!~['[object Date]', '[object Number]'].indexOf(Object.prototype.toString.call(config[val]))) {
				errors.push('Error: config.' + val + ' should be a Date object or a Number');
			}
		});

		return errors.length > 0 ? errors.join(', ') : null;
	}

	var cfxStRegex = /cfx\/st\//;

	function getResourceInfo(resource) {
		var parsedResource = url.parse(resource);
		parsedResource.resource = resource;
		parsedResource.type = 'http';

		// rtmp distros only encode the path/and/video.mp4
		if (parsedResource.protocol === 'rtmp:') {
			// no leading slash, cfx/st/, or query string in the resource
			parsedResource.resource = parsedResource.path
				.substr(1)
				.replace(cfxStRegex, '')
				.replace(parsedResource.search, '');

			parsedResource.type = 'rtmp';
		}

		return parsedResource;
	}

	function sanitizeForUrl(value) {
		return value.replace(/\+/g, '-').replace(/=/g, '_').replace(/\//g, '~');
	}

	function getPolicyType(policy) {
		var condition = policy.Statement[0].Condition;
		if (condition.DateGreaterThan || condition.IpAddress) {
			return 'custom';
		}
		return 'canned';
	}

	function buildPolicy(policy, resource) {
		policy.dateLessThan = Math.round(policy.dateLessThan / 1000);

		var condition = {
			"DateLessThan": {
				"AWS:EpochTime": policy.dateLessThan
			}
		};

		if (policy.dateGreaterThan) {
			condition.DateGreaterThan = {
				"AWS:EpochTime": Math.round(policy.dateGreaterThan / 1000)
			};
		}

		if (policy.ipAddress) {
			condition.IpAddress = {
				"AWS:SourceIp": policy.ipAddress
			};
		}

		return {
			"Statement": [
				{
					"Resource": resource,
					"Condition": condition
				}
			]
		};
	}

	return {
		signUrl: signUrl,
		getSignatureQueryString: getSignatureQueryString
	};
}();
