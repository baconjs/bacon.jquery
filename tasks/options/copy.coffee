module.exports =
  dist:
    expand: false
    src: "tmp/finalized/bacon.jquery.js"
    dest: "dist/bacon.jquery.js"

  finalize:
    expand: false
    src: "tmp/transpiled/bacon.jquery.js"
    dest: "tmp/finalized/bacon.jquery.js"

  testRun:
    files: [
      expand: true
      cwd: "tmp/test/transpiled"
      src: "**/*.js"
      dest: "tmp/test/run"
    ]
