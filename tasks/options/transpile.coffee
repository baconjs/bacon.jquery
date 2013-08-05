module.exports = app:
  type: "umd"
  moduleName: (path) ->
    # Leading '/' on AMD module name, why!?
    path.replace /^\//, ""
  imports:
    jquery: "$"
    bacon: "Bacon"

  files: [
    expand: true
    cwd: "tmp/compiled"
    src: ["**/*.js"]
    dest: "tmp/transpiled"
  ]
