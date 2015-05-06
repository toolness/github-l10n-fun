var fs = require('fs');
var express = require('express');
var request = require('superagent');
var bodyParser = require('body-parser');
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');

var webpackConfig = require('./webpack.config.js');
var githubRequest = require('./lib/github-request');

var PORT = process.env.PORT || 3000;
var PRODUCTION = process.env.NODE_ENV === 'production';
var STATIC_DIR = __dirname + '/static';
var INDEX_HTML_RE = /^[\/\-A-Za-z0-9]+$/;

var indexHTML;
var app = express();
var webpackCompiler = webpack(webpackConfig);
var startApp = function() {
  app.listen(PORT, function() {
    console.log("Listening on port", PORT);
  });
};

app.post('/api/authorize', bodyParser.json(), function(req, res, next) {
  request
    .post('https://github.com/login/oauth/access_token')
    .type('form')
    .accept('json')
    .send({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: req.body.code
    })
    .end(function(err, oauth2Res) {
      if (err) return next(err);
      res.send(oauth2Res.body);
    });
});

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

app.use(function(req, res, next) {
  if (!INDEX_HTML_RE.test(req.path))
    return next('route');
  if (!indexHTML || !PRODUCTION)
    indexHTML = fs.readFileSync(STATIC_DIR + '/index.html');
  return res.type('text/html').send(indexHTML);
});

app.use(express.static(STATIC_DIR));

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
