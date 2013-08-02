module.exports = {
  dist: {
    expand: false,
    src: 'tmp/finalized/Bacon.JQuery.Bindings.js',
    dest: 'dist/bacon.jquery.js'
  },
  finalize: {
    expand: false,
    src: 'tmp/transpiled/Bacon.JQuery.Bindings.js',
    dest: 'tmp/finalized/Bacon.JQuery.Bindings.js'
  }
};
