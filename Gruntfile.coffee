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
    simplemocha: config("simplemocha")

  require("matchdep").filterDev("grunt-*").forEach grunt.loadNpmTasks
  grunt.registerTask "build", ["clean:tmp", "coffee", "transpile", "copy:finalize"]
  grunt.registerTask "build:test", ["clean:tmp", "coffee:src", "coffee:test", "transpile:test"]
  grunt.registerTask "build:debug", "build"
  grunt.registerTask "build:dist", ["clean:dist", "build", "copy:dist", "uglify"]
  grunt.registerTask "test", ["test:unit"]
  grunt.registerTask "test:unit", ["build:test", "simplemocha:unit"]
  grunt.registerTask "default", ["build"]
