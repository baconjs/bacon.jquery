config = (name) ->
  require "./tasks/options/" + name
path = require("path")
module.exports = (grunt) ->
  grunt.initConfig
    clean: config("clean")
    coffee: config("coffee")
    copy: config("copy")
    uglify: config("uglify")

  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-clean"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.registerTask "build", ["clean:tmp", "coffee"]
  grunt.registerTask "build:debug", "build"
  grunt.registerTask "build:dist", ["clean:dist", "build", "copy:dist", "uglify"]
  grunt.registerTask "default", ["build"]
