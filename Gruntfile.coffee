renameFileWithDots = (dest, src) ->
  
  # grunt's file task has trouble renaming files with extra '.' in them
  # see: http://bit.ly/18D9Tra
  path.join dest, src.replace(/\.coffee$/, ".js")
path = require("path")
module.exports = (grunt) ->
  grunt.initConfig
    clean:
      tmp: ["tmp"]
      dist: ["dist"]

    coffee:
      compile:
        files: ["dist/bacon.jquery.js": "src/Bacon.JQuery.Bindings.coffee"]

      src:
        files: [
          expand: true
          cwd: "src/"
          src: ["**/*.coffee"]
          dest: "tmp/javascript"
          rename: renameFileWithDots
        ]

      test:
        files: [
          expand: true
          cwd: "test/"
          src: ["**/*.coffee"]
          dest: "tmp/javascript/tests"
          rename: renameFileWithDots
        ]

    uglify:
      dist:
        src: "dist/bacon.jquery.js"
        dest: "dist/bacon.jquery.min.js"

    copy:
      dist:
        expand: false
        src: "tmp/javascript/Bacon.JQuery.Bindings.js"
        dest: "dist/Bacon.JQuery.Bindings.js"


  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.registerTask "build", ["clean:tmp", "coffee"]
  grunt.registerTask "build:debug", "build"
  grunt.registerTask "build:dist", ["clean:dist", "build", "copy:dist", "uglify"]
  grunt.registerTask "default", ["build"]
