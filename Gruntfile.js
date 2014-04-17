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
      dev: {
        files: [
          'test/spec/{,*/}*.js',
          '<%= yeoman.app %>/scripts/{,*/}*.js'
        ],
        tasks: ['unit-test']
      },
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['newer:jshint:gruntfile']
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: [
        'Gruntfile.js'
      ],
      source: [
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
      staging: '<%= yeoman.staging %>',
      dist: '<%= yeoman.dist %>'
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
          flatten: true,
          filter: 'isFile',
          cwd: '<%= yeoman.app %>/scripts',
          dest: '<%= yeoman.staging %>/',
          src: [
            '**'
          ]
        }]
      }
    },

    //Minify the release code
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
          '<%= yeoman.staging %>/authenticationInterceptor.js',
          '<%= yeoman.staging %>/userStorageService.js',
          '<%= yeoman.staging %>/authenticationService.js',
          '<%= yeoman.staging %>/securityService.js'
        ],
        dest: '<%= yeoman.dist %>/<%= pkg.name %>.js'
      }
    },

    //bumps the version before a release
    bump: {
      options: {
        files:          ['package.json',  'bower.json'],
        updateConfigs:  ['pkg'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json', 'dist'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
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

  grunt.registerTask('compile', [
    'clean',            //Runs all clean tasks to clean staging and dist directories
    'copy:staging',     //Copies files to the staging directory
    'concat',           //Concatenates specified files in the staging directory
    'ngmin',            //Makes concatenated Angular code in staging directory min-safe
    'copy:dist',        //Copies concatenated, min-safe code to dist directory
    'jshint:dist',      //Lints the code in dist directory
    'uglify',           //Minifies the code in dist directory and creates a source map
    'clean:staging'     //Removes the staging directory
  ]);

  grunt.registerTask('unit-test', [
    'lint',             //Runs jshint on development code (src, test, gruntfile)
    'karma'             //Runs unit-test using karma
  ]);

  grunt.registerTask('e2e-test', []);

  grunt.registerTask('lint', [
    'jshint:gruntfile', //Lints the gruntfile
    'jshint:source',    //Lints all the files in /app/scripts
    'jshint:test'       //Lints all the test code in /test/spec using .jshintrc file in test directory
  ]);

  grunt.registerTask('build', [
    'unit-test',        //Runs unit tests
    'e2e-test',         //Runs end-to-end tests
    'compile'           //Generates distributable files
  ]);

  grunt.registerTask('release', function (releaseType) {

    if (['major', 'minor', 'patch'].indexOf(releaseType) === -1) {
      return grunt.util.error('Release type was ' + releaseType + ' but it must be either major, minor, or patch');
    }

    promising(this,
      ensureCleanMaster().then(function () {
        return grunt.task.run(
          'build',
          'bump:' + releaseType
        );
      })
    );
  });

  grunt.registerTask('ci', [
    'build'            //test and compile the code
  ]);

  grunt.registerTask('develop', [
    'watch'             //Watches /app/scripts and /test/spec for changes and runs unit-test task
  ]);

  grunt.registerTask('default', [
    'develop'           //Shortcut to develop task
  ]);

  // Helpers for custom tasks, mainly around promises / exec
  var exec = require('faithful-exec');

  function promising(task, promise) {
    var done = task.async();
    promise.then(function () {
      done();
    }, function (error) {
      grunt.log.write(error + '\n');
      done(false);
    });
  }

  function ensureCleanMaster() {
    return exec('git symbolic-ref HEAD').then(function (result) {
      if (result.stdout.trim() !== 'refs/heads/master') {
        throw 'Not on master branch, aborting';
      }
      return exec('git status --porcelain');
    }).then(function (result) {
      if (result.stdout.trim() !== '') {
        throw 'Working copy is dirty, aborting';
      }
    });
  }

};
