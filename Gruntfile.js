'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: [
        '/**',
        ' * <%= pkg.description %>',
        ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
        ' * @link <%= pkg.homepage %>',
        ' * @author <%= pkg.author %>',
        ' * @license MIT License, http://www.opensource.org/licenses/MIT',
        ' */'
      ].join('\n')
    },
    // Project settings
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist',
      staging: 'staging'
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: true
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'karma']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ],
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      },
      dist: {
        src: ['<%= yeoman.dist %>/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      staging: '<%= yeoman.staging %>',
      server: '.tmp'
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: ['<%= yeoman.dist %>']
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngmin: {
      staging: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.staging %>',
          src: '<%= pkg.name %>.js',
          dest: '<%= yeoman.staging %>/ngmin'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.staging %>/ngmin',
          dest: '<%= yeoman.dist %>',
          src: [
            '<%= pkg.name %>.js'
          ]
        }]
      },
      staging: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>/scripts',
          dest: '<%= yeoman.staging %>/',
          src: [
            '**'
          ]
        }]
      }
    },

    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    uglify: {
      dist: {
        options: {
          sourceMap: '<%= yeoman.dist %>/<%= pkg.name %>.map'
        },
        files: {
          '<%= yeoman.dist %>/<%= pkg.name %>.min.js': ['<%= yeoman.dist %>/<%= pkg.name %>.js']
        }
      }
    },
    concat: {
      options: {
        stripBanners: true,
        banner: [
          '<%= meta.banner %>',
          '(function(){',
          '\t\'use strict\';',
          ''
        ].join('\n'),
        footer: '\n}());',
        process: function(src){
          return src
              .replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1')
              .replace(/(^|\n)/g, '\n\t');
        }
      },
      staging: {
        src: [
          '<%= yeoman.staging %>/module.js',
          '<%= yeoman.staging %>/authenticationService.js',
          '<%= yeoman.staging %>/securityService.js'
        ],
        dest: '<%= yeoman.dist %>/<%= pkg.name %>.js'
      }
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    }
  });

  grunt.registerTask('dev', [
    'watch'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:staging',
    'clean:dist',
    'copy:staging',
    'concat',
    'ngmin',
    'copy:dist',
    'newer:jshint:dist',
    'uglify',
    'usemin'
  ]);

  grunt.registerTask('default', [
    'test',
    'build'
  ]);
};
