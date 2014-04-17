module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options: {
                port: 35270
            },
            web: {
                files: ['/*.js', 'stylesheets/**', 'javascripts/**'],
                tasks: ['default']
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['watch']);

};