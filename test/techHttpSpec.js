// In a test of techHttp
var techHttp = require('../techHttp.js');
var assert = require('chai').assert;
var BPromise = require('bluebird');

describe('tech-http', function() {
  it('accepts get with a single arg', function() {
    var mockRequest = {
      getAsync: function(url, opts) {
        assert.equal(url, 'http://foo:8080/api/bar/baz');
        return BPromise.resolve([{ statusCode: 200 }, {}]);
      }
    };

    var http = techHttp(mockRequest);

    return http.get('avop-ruuid-45', 'http://foo:8080/api/bar/baz');
  });

  it('measures the duration of a call', function() {
    // Ad-hoc mock for the 'request' library
    var mockRequest = {
      getAsync: function(url, opts) {
        assert.equal(url, 'http://foo:8080/api/bar/baz', 'Url should be set');
        assert.equal(opts.headers['X-foo'], 'bar');
        assert.ok(opts.json, 'Json should be requested');
        // Simulate a requests that takes a few milliseconds to run
        return new BPromise(function(resolve, reject) {
          setTimeout(function() {
            resolve([{ statusCode: 200 }, { foo: 'bar' }]);
          }, 100);
        });
      }
    };

    var http = techHttp(mockRequest);

    var duration = null;
    http.on('http', function(what) {
      assert.ok(what.ruuid === 'avop-ruuid-42', 'Ruuid should be set');
      assert.equal(what.category, 'cat');
      duration = what.duration;
    });

    return http
      .get('avop-ruuid-42', {
        url: 'http://foo:8080/api/bar/baz',
        category: 'cat',
        headers: { 'X-foo': 'bar' }
      })
      .then(
        function(result) {
          assert.ok(result.foo === 'bar', 'request apis should have been wrapped');
          assert.ok(parseFloat(duration.ms) > 90, 'the request time should have been logged');
          assert.ok(parseFloat(duration.ms) < 250, 'the request time should not be that huge !');
        },
        function(error) {
          throw new Error('Rejected with ' + JSON.stringify(error));
        }
      );
  });
});
