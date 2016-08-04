module.exports = function(grunt) {

    grunt.loadNpmTasks("grunt-tag");
    grunt.loadNpmTasks("grunt-release");
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.initConfig({
        mochaTest: {
            test_spec: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*.js']
            },
            test_json: {
                options: {
                    reporter: 'json',
                    quiet: true,
                    captureFile: "reports/json/TEST-tech-http.json"
                },
                src: ['test/**/*.js']
            }
        },
        release: {
            options: {
                npm: false, // Important to avoid pushing to npm.org
                afterReleaseTasks: ['tag'],
                github: {
                    repo: "AirVantage/node-tech-http",
                    accessTokenVar: "GITHUB_ACCESS_TOKEN"
                }
            }
        },
        tag: {
            options: {
                tagName: '<%= version.match(/\\d*/) %>.x'
            }
        }
    });

    grunt.registerTask('test', ['mochaTest:test_spec']);
    grunt.registerTask('test-json', ['mochaTest:test_json']);

};
