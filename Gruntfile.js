
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    webpack: {
      dev: require('./webpack.dev.config'),
      release: require('./webpack.release.config')
    }
  });
};
