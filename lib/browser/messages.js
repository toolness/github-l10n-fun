var fs = require('fs');
var path = require('path');

var LOCALE_DIR = __dirname + '/../../locale';

module.exports = fs.readdirSync(LOCALE_DIR)
  .filter(function(filename) {
    return /\.json$/.test(filename);
  }).map(function(filename) {
    var basename = path.basename(filename, '.json');
    return 'exports[' +
           JSON.stringify(basename) + '] = require("../../locale/' +
           basename + '.json");';
  }).join('\n');
