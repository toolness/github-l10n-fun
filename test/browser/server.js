var http = require('http');
var path = require('path');
var express = require('express');

var ROOT_DIR = path.normalize(path.join(__dirname, '..', '..'));
var STATIC_DIR = path.join(ROOT_DIR, 'static');
var MOCHA_DIR = path.join(ROOT_DIR, 'node_modules', 'mocha');

exports.create = function create() {
  var app = express();
  var server = http.createServer(app);

  app.use(express.static(STATIC_DIR));
  app.use('/test/mocha', express.static(MOCHA_DIR));

  return server;
};
