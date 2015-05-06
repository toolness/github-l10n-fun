var express = require('express');
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');

var webpackConfig = require('./webpack.config.js');

var PORT = process.env.PORT || 3000;
var PRODUCTION = process.env.NODE_ENV === 'production';

var app = express();
var webpackCompiler = webpack(webpackConfig);
var startApp = function() {
  app.listen(PORT, function() {
    console.log("Listening on port", PORT);
  });
};

if (!PRODUCTION) {
  app.use(webpackMiddleware(webpackCompiler, {
    noInfo: false,
    quiet: false,
    watchDelay: 300,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  }));
}

app.use(express.static(__dirname + '/static'));

if (PRODUCTION) {
  console.log("Running webpack compiler...");
  webpackCompiler.run(function(err, stats) {
    if (err) throw err;
    var jsonStats = stats.toJson();
    if (jsonStats.errors.length || jsonStats.warnings.length) {
      console.log(stats.toString());
      process.exit(1);
    }
    startApp();
  });
} else {
  startApp();
}
