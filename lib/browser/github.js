var auth = require('./auth');
var githubRequest = require('../github-request');
var PagedEntityStream = require('../paged-entity-stream');

var DEFAULT_LOCALE = 'en';
var LOCALE_PATH = '/locale';

var authGithubRequest = function(method, path) {
  return githubRequest(method, path, auth.getAccessToken());
};

var localeMessagesPath = function(options) {
  var locale = options.locale || DEFAULT_LOCALE;
  return '/repos/' + options.owner +
         '/' + options.repo +
         '/contents' + LOCALE_PATH +
         '/' + locale + '.json';
};

exports.DEFAULT_LOCALE = DEFAULT_LOCALE;
exports.LOCALE_PATH = LOCALE_PATH;

exports.commitLocaleMessages = function(options, cb) {
  var body = {
    content: new Buffer(options.content).toString('base64'),
    message: options.message,
    branch: options.branch
  };
  if (options.sha)
    body.sha = options.sha;
  authGithubRequest('PUT', localeMessagesPath(options))
    .send(body)
    .end(function(err, res) {
      if (err) return cb(err);
      cb(null, res.body);
    });
};

exports.fetchLocaleMessages = function(options, cb) {
  authGithubRequest('GET', localeMessagesPath(options))
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
      return cb(null, messages, res.body.sha);
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
