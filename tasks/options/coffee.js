var path = require("path");

function renameFileWithDots(dest, src){
  // grunt's file task has trouble renaming files with extra '.' in them
  // see: http://bit.ly/18D9Tra
  return path.join(dest, src.replace(/\.coffee$/, '.js'));
}

module.exports = {
  src: {
    files: [{
      expand: true,
      cwd: 'src',
      src: ['**/*.coffee'],
      dest: 'tmp/compiled',
      rename: renameFileWithDots
    }]
  },
  test: {
    files: [{
      expand: true,
      cwd: 'test/',
      src: ['**/*.coffee'],
      dest: 'tmp/javascript/tests',
      rename: renameFileWithDots
    }]
  }
};
