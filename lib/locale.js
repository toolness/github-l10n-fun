var fs = require('fs');
var path = require('path');

var LOCALE_DIR = __dirname + '/../locale';

function getLocaleInfo() {
  return fs.readdirSync(LOCALE_DIR)
    .filter(function(filename) {
      return /\.json$/.test(filename);
    }).map(function(filename) {
      var basename = path.basename(filename, '.json');
      return {
        name: basename,
        path: path.normalize(path.join(LOCALE_DIR, filename))
      };
    });
}

function generateModuleJs(relativePrefix) {
  return getLocaleInfo()
    .map(function(info) {
      return 'exports[' +
             JSON.stringify(info.name) + '] = require(' +
             JSON.stringify(info.path) + ');';
    }).join('\n');
}

exports.getLocaleInfo = getLocaleInfo;
exports.generateModuleJs = generateModuleJs;
