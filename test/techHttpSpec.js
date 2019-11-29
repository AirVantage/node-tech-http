// In a test of techHttp
const techHttp = require('../techHttp.js');
const assert = require('chai').assert;
const BPromise = require('bluebird');

describe('tech-http', () => {
  it('accepts get with a single arg', () => {
    const http = techHttp({
      getAsync: url => {
        assert.equal(url, 'http://foo:8080/api/bar/baz');
        return BPromise.resolve([{ statusCode: 200 }, {}]);
      }
    });

    return http.get('avop-ruuid-45', 'http://foo:8080/api/bar/baz');
  });

  it('accepts get with an options Object', () => {
    // Ad-hoc mock for the 'request' library
    const http = techHttp({
      getAsync: (url, opts) => {
        assert.equal(url, 'http://foo:8080/api/bar/baz', 'Url should be set');
        assert.equal(opts.headers['X-foo'], 'bar');
        assert.ok(opts.json, 'Json should be requested');
        return BPromise.resolve([{ statusCode: 200 }, { foo: 'bar' }]);
      }
    });

    return http.get('avop-ruuid-42', { url: 'http://foo:8080/api/bar/baz', headers: { 'X-foo': 'bar' } }).then(
      result => {
        assert.ok(result.foo === 'bar', 'request apis should have been wrapped');
      },
      error => {
        throw new Error('Rejected with ' + JSON.stringify(error));
      }
    );
  });
});
