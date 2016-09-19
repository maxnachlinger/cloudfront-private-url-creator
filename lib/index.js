'use strict'
const crypto = require('crypto')
const querystring = require('querystring')
const url = require('url')

module.exports.signUrl = function signUrl (resource, config, signCb) {
  const signatureQueryString = exports.getSignatureQueryString(resource, config)
  const resourceInfo = getResourceInfo(resource)

  const url = resourceInfo.protocol + '//' + resourceInfo.host + resourceInfo.path +
    (~resourceInfo.path.indexOf('?') ? '&' : '?') + signatureQueryString

  if (!signCb) {
    return url
  }
  setImmediate(() => signCb(null, url))
}

module.exports.getSignatureQueryString = function getSignatureQueryString (resource, config, signCb) {
  const argErrors = sanityCheckArgs(resource, config)
  if (argErrors) {
    if (!signCb) {
      throw new Error(argErrors)
    }
    return setImmediate(() => signCb(new Error(argErrors)))
  }

  const resourceInfo = getResourceInfo(resource)

  // since config is a reference, this ensures we don't introduce some side-effect in the calling code
  const policy = buildPolicy(JSON.parse(JSON.stringify(config), (key, value) => {
    if (~[ 'dateLessThan', 'dateGreaterThan' ].indexOf(key)) {
      value = new Date(value).getTime()
    }
    return value
  }), resourceInfo.resource)
  const policyString = JSON.stringify(policy)

  const query = {
    Signature: sanitizeForUrl(crypto.createSign('RSA-SHA1').update(policyString).sign(config.privateKey, 'base64')),
    'Key-Pair-Id': config.keyPairId
  }

  const policyType = getPolicyType(policy)

  if (policyType === 'custom') {
    query.Policy = sanitizeForUrl(new Buffer(policyString, 'utf8').toString('base64'))
  } else {
    query.Expires = policy.Statement[ 0 ].Condition.DateLessThan[ 'AWS:EpochTime' ]
  }

  const signature = querystring.stringify(query)
  if (!signCb) {
    return signature
  }
  setImmediate(() => signCb(null, signature))
}

const sanityCheckArgs = (resource, config) => {
  const errors = []
  const validProtocols = [ 'http:', 'https:', 'rtmp:', 'rtmpt:', 'rtmpe:', 'rtmpte:' ]

  if (!resource) {
    errors.push('Error: resource parameter is required')
  }

  if (!config) {
    errors.push('Error: config parameter is required')
    return errors.join(', ')
  }

  if (!~validProtocols.indexOf(url.parse(resource).protocol)) {
    errors.push(`Error: invalid resource protocol, resource should begin with: ${validProtocols.join(', ')}`)
    return errors.join(', ')
  }

  [ 'privateKey', 'keyPairId', 'dateLessThan' ].forEach(val => {
    if (typeof config[ val ] === 'undefined') {
      errors.push(`Error: config.${val} is required`)
    }
  });

  [ 'dateLessThan', 'dateGreaterThan' ].forEach(val => {
    if (!config[ val ]) {
      return
    }
    if (!~[ '[object Date]', '[object Number]' ].indexOf(Object.prototype.toString.call(config[ val ]))) {
      errors.push(`Error: config.${val} should be a Date object or a Number`)
    }
  })

  return errors.length > 0 ? errors.join(', ') : null
}

const cfxStRegex = /cfx\/st\//

const getResourceInfo = (resource) => {
  const parsedResource = url.parse(resource)
  parsedResource.resource = resource
  parsedResource.type = 'http'

  // rtmp distros only encode the path/and/video.mp4
  if (parsedResource.protocol === 'rtmp:') {
    // no leading slash, cfx/st/, or query string in the resource
    parsedResource.resource = parsedResource.path
      .substr(1)
      .replace(cfxStRegex, '')
      .replace(parsedResource.search, '')

    parsedResource.type = 'rtmp'
  }

  return parsedResource
}

const sanitizeForUrl = (value) => {
  return value
    .replace(/\+/g, '-')
    .replace(/=/g, '_')
    .replace(/\//g, '~')
}

const getPolicyType = (policy) => {
  const condition = policy.Statement[ 0 ].Condition
  if (condition.DateGreaterThan || condition.IpAddress) {
    return 'custom'
  }
  return 'canned'
}

const buildPolicy = (policy, resource) => {
  policy.dateLessThan = Math.round(policy.dateLessThan / 1000)

  const condition = {
    DateLessThan: {
      'AWS:EpochTime': policy.dateLessThan
    }
  }

  if (policy.dateGreaterThan) {
    condition.DateGreaterThan = {
      'AWS:EpochTime': Math.round(policy.dateGreaterThan / 1000)
    }
  }

  if (policy.ipAddress) {
    condition.IpAddress = {
      'AWS:SourceIp': policy.ipAddress
    }
  }

  return {
    Statement: [
      {
        Resource: resource,
        Condition: condition
      }
    ]
  }
}
