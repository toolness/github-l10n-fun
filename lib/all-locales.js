var fs = require('fs');
var path = require('path');

var filename = path.join(__dirname, '..', 'node_modules', 'react-intl',
                         'node_modules', 'intl-messageformat',
                         'lib', 'locales.js');
var js = fs.readFileSync(filename, 'utf-8');

var locales = ["en-PI"];

var match = js.replace(/"locale":"([A-Za-z\-]+)"/g, function() {
  locales.push(arguments[1]);
});

locales.sort();

module.exports = locales;

if (!module.parent) {
  console.log('writing all-locales.json.');
  fs.writeFileSync(
    path.join(__dirname, 'all-locales.json'),
    JSON.stringify(locales, null, 2)
  );
}
