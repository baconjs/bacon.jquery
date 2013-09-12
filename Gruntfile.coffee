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
    karma: config("karma")
    release: config("release")

  require("matchdep").filterDev("grunt-*").forEach grunt.loadNpmTasks
  grunt.registerTask "build", ["clean:tmp", "coffee", "transpile", "copy:finalize"]
  grunt.registerTask "build:test", ["clean:tmp", "coffee:src", "coffee:test", "transpile:test", "copy:testRun"]
  grunt.registerTask "build:browserTest", ["clean:tmp", "coffee:src", "transpile:browserTest", "copy:testRun"]
  grunt.registerTask "build:debug", "build"
  grunt.registerTask "build:dist", ["clean:dist", "build", "copy:dist", "uglify"]
  grunt.registerTask "test", ["test:unit", "test:browser"]
  grunt.registerTask "test:unit", ["build:test", "simplemocha:unit"]
  grunt.registerTask "test:browser", ["test:browser:local"]
  grunt.registerTask "test:browser:local", ["build:browserTest", "karma:dev"]
  grunt.registerTask "test:browser:integration", ["build:browserTest", "karma:integration"]

  grunt.registerTask "default", ["build"]
