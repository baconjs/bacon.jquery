renameFileWithDots = (dest, src) ->

  # grunt's file task has trouble renaming files with extra '.' in them
  # see: http://bit.ly/18D9Tra
  path.join dest, src.replace(/\.coffee$/, ".js")

path = require("path")
module.exports =
  src:
    files: [
      expand: true
      cwd: "src"
      src: ["**/*.coffee"]
      dest: "tmp/compiled"
      rename: renameFileWithDots
    ]
    options:
      bare: true

  test:
    files: [
      expand: true
      cwd: "test/"
      src: ["**/*.coffee"]
      dest: "tmp/test/compiled"
      rename: renameFileWithDots
    ]
