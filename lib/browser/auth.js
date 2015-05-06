var request = require('superagent');
var querystring = require('querystring');

var githubRequest = require('../github-request');

var ORIGIN = window.location.protocol + '//' +
             window.location.host;

exports.getUsername = function() {
  return window.sessionStorage.username || null;
};

exports.getAccessToken = function() {
  return window.sessionStorage.accessToken || null;
};

exports.logout = function() {
  delete window.sessionStorage.username;
  delete window.sessionStorage.accessToken;
};

exports.startLogin = function() {
  var state = Math.random().toString();
  var qs = querystring.stringify({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: ORIGIN + '/',
    scope: '',
    state: state
  });
  var url = 'https://github.com/login/oauth/authorize?' + qs;
  window.sessionStorage['oauth2_state'] = state;
  window.location = url;
};

exports.completeLogin = function(code, state, cb) {
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

      githubRequest('get', '/user', res.body.access_token)
        .end(function(err, res) {
          if (err) return cb(err);

          window.sessionStorage.accessToken = res.body.access_token;
          window.sessionStorage.username = res.body.login;
          delete window.sessionStorage['oauth2_state'];
          cb(null);
        });
    });
};
