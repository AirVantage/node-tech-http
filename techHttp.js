const _ = require('lodash');
const BPromise = require('bluebird');

module.exports = mockRequest => {
    const request = mockRequest || BPromise.promisifyAll(require('request'));

    const wrapRequest = (fnName, options) => {
        return request[fnName](options.url, options).spread(function(response, body) {
            if (response && _.includes([200, 201, 202, 203, 204, 205, 206], response.statusCode)) {
                return body;
            }
            return BPromise.reject({ body, response: response ? response.statusCode : response });
        });
    };

    return {
        get: (ruuid, options) =>
            _.isString(options)
                ? wrapRequest('getAsync', { json: true, url: options })
                : wrapRequest('getAsync', _.assignIn({ json: true }, options)),

        post: (ruuid, options) => wrapRequest('postAsync', _.assignIn({ json: true }, options)),

        delete: (ruuid, options) => wrapRequest('delAsync', _.assignIn({ json: true }, options)),

        put: (ruuid, options) => wrapRequest('putAsync', _.assignIn({ json: true }, options))
    };
};
