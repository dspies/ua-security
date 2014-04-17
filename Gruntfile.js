module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options: {
                port: 35270
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: ['*.html', 'stylesheets/**', 'javascripts/**']
            }
        },
        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: true
                }
            }
        }
    });

    // Load the plugins
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', [
        'connect:livereload',
        'watch'
    ]);

};