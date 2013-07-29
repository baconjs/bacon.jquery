module.exports = (grunt) ->
  grunt.initConfig
    clean:
      dist: ["dist/"]
      coffee: ["dist/*.coffee"]

    coffee:
      compile:
        files: ["dist/Bacon.JQuery.Bindings.js": "src/Bacon.JQuery.Bindings.coffee"]

    uglify:
      dist:
        src: "dist/Bacon.JQuery.Bindings.js"
        dest: "dist/Bacon.JQuery.Bindings.min.js"

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.registerTask "build", ["clean:dist", "coffee", "uglify", "clean:coffee"]
  grunt.registerTask "default", ["build"]