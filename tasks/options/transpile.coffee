module.exports =
  src:
    type: "umd"
    moduleName: (path) ->
      # Leading '/' on AMD module name, why!?
      path.replace /^\//, ""
    imports:
      jquery: "$"
      baconjs: "Bacon"

    files: [
      expand: true
      cwd: "tmp/compiled"
      src: ["**/*.js"]
      dest: "tmp/transpiled"
    ]
