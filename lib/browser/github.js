var auth = require('./auth');
var githubRequest = require('../github-request');
var PagedEntityStream = require('../paged-entity-stream');

var DEFAULT_LOCALE = 'en';
var LOCALE_PATH = '/locale';

var authGithubRequest = function(method, path) {
  return githubRequest(method, path, auth.getAccessToken());
};

exports.DEFAULT_LOCALE = DEFAULT_LOCALE;
exports.LOCALE_PATH = LOCALE_PATH;

exports.fetchLocaleMessages = function(options, cb) {
  var locale = options.locale || DEFAULT_LOCALE;
  authGithubRequest('GET', '/repos/' + options.owner +
                           '/' + options.repo +
                           '/contents' + LOCALE_PATH +
                           '/' + locale + '.json')
    .query({ref: options.branch})
    .end(function(err, res) {
      if (err) return cb(err);
      // TODO: Test all kinds of edge cases here.
      try {
        var messages = JSON.parse(
          new Buffer(res.body.content, 'base64').toString('utf-8')
        );
      } catch (e) {
        return cb(e);
      }
      return cb(null, messages);
    });
};

exports.fetchLocaleList = function(options, cb) {
  authGithubRequest('GET', '/repos/' + options.owner +
                    '/' + options.repo + '/contents' + LOCALE_PATH)
    .query({ref: options.branch})
    .end(function(err, res) {
      if (err) return cb(err);
      // TODO: Test all kinds of edge cases here.
      var locales = res.body.map(function(info) {
        var match = info.name.match(/^(.+)\.json$/);
        return match[1];
      });
      cb(null, locales);
    }.bind(this));
};

exports.fetchRepoInfo = function(options, cb) {
  var branches = [];
  var baseURL = '/repos/' + options.owner + '/' + options.repo;

  var stream = new PagedEntityStream({
    url: baseURL + '/branches',
    request: authGithubRequest
  }).on('data', function(branch) {
    branches.push(branch.name);
  }).on('error', function(e) {
    cb(e);
  }.bind(this)).on('end', function() {
    authGithubRequest('GET', baseURL).end(function(err, res) {
      if (err)
        return cb(err);
      // TODO: Test all kinds of edge cases here.
      cb(null, {
        branches: branches,
        repo: res.body
      });
    });
  });
};
