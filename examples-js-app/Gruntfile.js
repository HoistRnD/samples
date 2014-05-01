module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cssmin: {
            css: {
                src: ['src/css/style.css'],
                dest: 'css/<%= pkg.libName %>.min.css'
            }
        },
        uglify: {
            js: {
              options: {

                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                  'Hoist Apps Limited */\r\n',

                sourceMap: 'js/<%= pkg.libName %>.min.map.js',
                sourceMappingURL: '<%= pkg.libName %>.min.map.js'

              },
              files: {
                  'js/<%= pkg.libName %>.min.js': [
                    'src/js/jquery-2.0.3.min.js',
                    'src/js/underscore.min.js',
                    'src/js/hoist.js',
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
