var _ = require("underscore");
var events = require("events");
var techTime = require("node-tech-time");
var techRuuid = require("node-tech-ruuid");
var BPromise = require("bluebird");

module.exports = function(mockRequest) {

    var request = mockRequest || BPromise.promisifyAll(require("request"));

    var emitter = new events.EventEmitter();

    function wrapRequest(ruuid, fnName, options, category) {

        techRuuid.check(ruuid);

        category = category || "AppCore";

        var start = techTime.start();

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

    return {
        on: emitter.on.bind(emitter),

        // TODO [JLE] 'timeout' and 'auth' should be removed and declared instead directly in the given 'options' parameter
        get: function wrapGet(ruuid, url, category, timeout, auth, options) {
            return wrapRequest(ruuid, "getAsync", _.extend({
                url: url,
                json: true,
                auth: auth,
                timeout: timeout
            }, options), category);
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
