module.exports = {
  app: {
    type: 'globals',
    imports: { jquery: "$", bacon: "Bacon" },
    files: [{
      expand: true,
      cwd: 'tmp/compiled',
      src: ['**/*.js'],
      dest: 'tmp/transpiled'
    }]
  }
};
