config = (name) ->
  require "./tasks/options/" + name
path = require("path")
module.exports = (grunt) ->
  grunt.initConfig
    clean: config("clean")
    transpile: config("transpile")
    coffee: config("coffee")
    copy: config("copy")
    uglify: config("uglify")

  require("matchdep").filterDev("grunt-*").forEach grunt.loadNpmTasks
  grunt.registerTask "build", ["clean:tmp", "coffee", "transpile", "copy:finalize"]
  grunt.registerTask "build:debug", "build"
  grunt.registerTask "build:dist", ["clean:dist", "build", "copy:dist", "uglify"]
  grunt.registerTask "default", ["build"]
