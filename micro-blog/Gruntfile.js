module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cssmin: {
            css: {
                src: ['src/css/style.css'],
                dest: 'css/hurtle.min.css'
            }
        },
        uglify: {
            js: {
              options: {

                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                  'Hoist Apps Limited */\r\n',

                sourceMap: 'js/hurtle.min.map.js',
                sourceMappingURL: 'hurtle.min.map.js'

              },
              files: {
                  'js/hurtle.min.js': [
                    'src/js/jquery-2.0.3.min.js',
                    'src/js/underscore.min.js',
                    'src/js/hoist.js',
                    'src/js/helpers.js',
                    'src/js/account.js',
                    'src/js/marked.js',
                    'src/js/app.js'
                  ]
              }
            }
        },
        watch: {
          static: {
            files: ['src/js/*.js', 'src/css/*.css'],
            tasks: ['uglify', 'cssmin']
          }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['cssmin', 'uglify']);
    grunt.registerTask('watch', ['watch:static']);

};
