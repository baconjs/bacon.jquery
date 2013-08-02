module.exports = {
  options: {
    globals: [],
    timeout: 3000,
    ignoreLeaks: false,
    compilers: 'coffee:coffee-script'
  },

  all: { src: ['tmp/test/transpiled/**/*.js'] }
};


