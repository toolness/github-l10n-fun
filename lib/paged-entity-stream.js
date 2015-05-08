var Readable = require('stream').Readable;
var util = require('util');
var parseLinkHeader = require('parse-link-header');

var githubRequest = require('./github-request');

function PagedEntityStream(options) {
  Readable.call(this, {
    objectMode: true
  });
  this._cachedEntities = [];
  this._nextURL = options.url;
  this._request = options.request || githubRequest;
  this.options = options;
}

util.inherits(PagedEntityStream, Readable);

PagedEntityStream.prototype._fetchMoreEntities = function() {
  var self = this;
  var options = this.options;

  this._request('GET', this._nextURL)
    .end(function(err, res) {
      var body = res && res.body;

      if (err) {
        return self.emit('error', err);
      }

      if (res.status != 200) {
        return self.emit('error', new Error("got HTTP " + res.status));
      }

      var link = parseLinkHeader(res.headers['link']);

      self._nextURL = link && link.next && link.next.url;
      self._cachedEntities.push.apply(self._cachedEntities, body);
      self._read();
    });
};

PagedEntityStream.prototype._read = function() {
  if (this._cachedEntities.length) {
    this.push(this._cachedEntities.shift());
  } else if (!this._nextURL) {
    this.push(null);
  } else {
    this._fetchMoreEntities();
  }
};

module.exports = PagedEntityStream;
