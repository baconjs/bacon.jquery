module.exports = {
  app: {
    type: 'umd',
    imports: { jquery: "$", bacon: "Bacon" },
    files: [{
      expand: true,
      cwd: 'tmp/compiled',
      src: ['**/*.js'],
      dest: 'tmp/transpiled'
    }]
  }
};
