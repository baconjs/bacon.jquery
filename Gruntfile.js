module.exports = function (grunt) {
  grunt.initConfig({
    clean: {
      dist: ['dist/'],
      coffee: ['dist/*.coffee']
    },
    coffee: {
      compile: {
        files: [
          {
            'dist/Bacon.JQuery.Bindings.js': 'src/Bacon.JQuery.Bindings.coffee',
          }
        ]
      }
    },
    uglify: {
      dist: {
        src: 'dist/Bacon.JQuery.Bindings.js',
        dest: 'dist/Bacon.JQuery.Bindings.min.js'
      }
    },
    copy: {
      dist: {
        files: [
          {
            src: ['src/Bacon.JQuery.Bindings.coffee'],
            dest: 'dist/'
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('build', ['clean:dist', 'copy', 'coffee', 'uglify', 'clean:coffee']);
  grunt.registerTask('default', ['build']);
};
