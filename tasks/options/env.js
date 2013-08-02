function bowerPath(){
  var bpath = ":" + './bower_components';
  if(process.env.NODE_PATH){
    bpath = process.env.NODE_PATH + bpath;
  }

  return bpath;
}

module.exports = {
  bowerPath: {
    "NODE_PATH": bowerPath()
  }
};
