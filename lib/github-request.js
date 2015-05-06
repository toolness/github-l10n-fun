var urlResolve = require('url').resolve;
var request = require('superagent');

var BASE_URL = 'https://api.github.com';

function githubRequest(method, path, accessToken) {
  var url = urlResolve(BASE_URL, path);
  var req = request(method, url)
    .accept('json');

  if (accessToken)
    req = req.set('Authorization', 'token ' + accessToken)

  return req;
}

module.exports = githubRequest;
module.exports.url = urlResolve.bind(null, BASE_URL);
