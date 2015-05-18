var _ = require("lodash");
var BPromise = require("bluebird");
var events = require("events");
var techRuuid = require("node-tech-ruuid");
var techTime = require("node-tech-time");
var logger = require("node-tech-logger");

module.exports = function(mockRequest) {

    var request = mockRequest || BPromise.promisifyAll(require("request"));

    var emitter = new events.EventEmitter();

    function wrapRequest(ruuid, fnName, options, category) {

        techRuuid.check(ruuid);

        category = category || "core";

        var start = techTime.start();

        logger.debug("[http] Request options", options);
        logger.debug("[http] Request headers", options.headers);

        return request[fnName](options.url, options).then(function(responseAndBody) {
            var response = responseAndBody[0];
            var body = responseAndBody[1];

            emitter.emit("http", {
                category: category,
                ruuid: ruuid || 'unknown',
                url: options.url,
                duration: techTime.end(start)
            });

            if (response && _.contains([200, 201, 202, 203, 204, 205, 206], response.statusCode)) {
                return body;
            } else {
                return BPromise.reject({
                    response: response ? response.statusCode : response,
                    body: body
                });
            }

        });

    }

    /**
     * Simpler form of get
     *
     * @param options.url
     * @param [options.category]
     * @param [options.timeout]
     * @param [options.auth]
     * @param [options.headers]
     *
     * Options object is also passed as such to the 'request' library'
     */
    function getFromOpts(ruuid, opts) {
        return wrapRequest(ruuid, "getAsync", _.extend({
            json: true
        }, opts), opts.category);
    }

    return {
        on: emitter.on.bind(emitter),

        // TODO [JLE] 'timeout' and 'auth' should be removed and declared instead directly in the given 'options' parameter
        get: function wrapGet(ruuid, url, category, timeout, auth, options) {

            if (!_.isString(url) && arguments.length === 2) {
                var opts = url;
                return getFromOpts(ruuid, opts);
            } else {
                return wrapRequest(ruuid, "getAsync", _.extend({
                    url: url,
                    json: true,
                    auth: auth,
                    timeout: timeout
                }, options), category);

            }

        },

        // TODO [JLE] 'timeout' and 'auth' should be removed and declared instead directly in the given 'options' parameter
        post: function wrapPost(ruuid, url, body, category, timeout, auth, options) {
            return wrapRequest(ruuid, "postAsync", _.extend({
                url: url,
                json: body,
                auth: auth,
                timeout: timeout
            }, options), category);
        },

        // TODO [JLE] 'timeout' and 'auth' should be removed and declared instead directly in the given 'options' parameter
        delete: function wrapDelete(ruuid, url, body, category, timeout, auth, options) {
            return wrapRequest(ruuid, "delAsync", _.extend({
                url: url,
                json: body,
                auth: auth,
                timeout: timeout
            }, options), category);
        },

        // TODO [JLE] 'timeout' and 'auth' should be removed and declared instead directly in the given 'options' parameter
        put: function wrapPut(ruuid, url, body, category, timeout, auth, options) {
            return wrapRequest(ruuid, "putAsync", _.extend({
                url: url,
                json: body,
                auth: auth,
                timeout: timeout
            }, options), category);
        }
    };
};
