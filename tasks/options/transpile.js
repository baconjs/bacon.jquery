module.exports = {
  app: {
    type: 'umd',
    moduleName: function(path) {
      // Leading '/' on AMD module name, why!?
      return path.replace(/^\//, "");
    },
    imports: { jquery: "$", bacon: "Bacon" },
    files: [{
      expand: true,
      cwd: 'tmp/compiled',
      src: ['**/*.js'],
      dest: 'tmp/transpiled'
    }]
  }
};
