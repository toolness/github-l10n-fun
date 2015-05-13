var EventEmitter = require('events').EventEmitter;
var urlResolve = require('url').resolve;
var request = require('superagent');
var querystring = require('querystring');

var githubRequest = require('../github-request');

var ORIGIN = window.location.protocol + '//' +
             window.location.host;

var auth = new EventEmitter();

auth.getUsername = function() {
  return window.sessionStorage.username || null;
};

auth.getAccessToken = function() {
  return window.sessionStorage.accessToken || null;
};

auth.logout = function() {
  delete window.sessionStorage.username;
  delete window.sessionStorage.accessToken;
  auth.emit('change');
};

auth.startLogin = function(callback) {
  var state = Math.random().toString();
  var qs = querystring.stringify({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: urlResolve(ORIGIN, callback),
    scope: ['public_repo'].join(','),
    state: state
  });
  var url = 'https://github.com/login/oauth/authorize?' + qs;
  window.sessionStorage['oauth2_state'] = state;
  window.location = url;
};

auth.completeLogin = function(code, state, cb) {
  if (state !== window.sessionStorage['oauth2_state']) {
    return process.nextTick(function() {
      cb(new Error('invalid state'));
    });
  }

  request
    .post('/api/authorize')
    .type('json')
    .accept('json')
    .send({code: code})
    .end(function(err, res) {
      if (err) return cb(err);
      if (res.body.error) return cb(new Error(res.body.error));

      var accessToken = res.body.access_token;

      githubRequest('get', '/user', accessToken)
        .end(function(err, res) {
          if (err) return cb(err);

          window.sessionStorage.accessToken = accessToken;
          window.sessionStorage.username = res.body.login;
          delete window.sessionStorage['oauth2_state'];
          cb(null);
          auth.emit('change');
        });
    });
};

module.exports = auth;
