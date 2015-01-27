module.exports = function(grunt) {

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
        }
    });

    grunt.registerTask('test', ['mochaTest:test_spec']);
    grunt.registerTask('test-json', ['mochaTest:test_json']);

};
