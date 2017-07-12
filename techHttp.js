var _ = require('lodash');
var BPromise = require('bluebird');
var events = require('events');
var techRuuid = require('node-tech-ruuid');
var techTime = require('node-tech-time');
var logger = require('node-tech-logger');

module.exports = function(mockRequest) {
  var request = mockRequest || BPromise.promisifyAll(require('request'));

  var emitter = new events.EventEmitter();

  function wrapRequest(ruuid, fnName, options, category) {
    techRuuid.check(ruuid);

    category = category || 'core';

    var start = techTime.start();

    logger.debug('[http] Request options', options);
    logger.debug('[http] Request headers', options.headers);

    return request[fnName](options.url, options).spread(function(response, body) {
      emitter.emit('http', {
        category: category,
        ruuid: ruuid || 'unknown',
        url: options.url,
        duration: techTime.end(start)
      });

      if (response && _.includes([200, 201, 202, 203, 204, 205, 206], response.statusCode)) {
        return body;
      } else {
        return BPromise.reject({
          response: response ? response.statusCode : response,
          body: body
        });
      }
    });
  }

  return {
    on: emitter.on.bind(emitter),

    /**
         * http get
         *
         * @param options.url
         * @param [options.category]
         * @param [options.timeout]
         * @param [options.auth]
         * @param [options.headers]
         * @param [options.json]
         */
    get: function wrapGet(ruuid, options) {
      if (_.isString(options)) {
        options = { url: options };
      }

      return wrapRequest(ruuid, 'getAsync', _.assignIn({ json: true }, options), options.category);
    },

    /**
         * http post
         *
         * @param options.url
         * @param [options.category]
         * @param [options.timeout]
         * @param [options.auth]
         * @param [options.headers]
         * @param [options.json]
         * @param [options.body]
         */
    post: function wrapPost(ruuid, options) {
      return wrapRequest(ruuid, 'postAsync', _.assignIn({ json: true }, options), options.category);
    },

    /**
         * http delete
         *
         * @param options.url
         * @param [options.category]
         * @param [options.timeout]
         * @param [options.auth]
         * @param [options.headers]
         * @param [options.json]
         * @param [options.body]
         */
    delete: function wrapDelete(ruuid, options) {
      return wrapRequest(ruuid, 'delAsync', _.assignIn({ json: true }, options), options.category);
    },

    /**
         * http put
         *
         * @param options.url
         * @param [options.category]
         * @param [options.timeout]
         * @param [options.auth]
         * @param [options.headers]
         * @param [options.json]
         * @param [options.body]
         */
    put: function wrapPut(ruuid, options) {
      return wrapRequest(ruuid, 'putAsync', _.assignIn({ json: true }, options), options.category);
    }
  };
};
