var should = require('should');
var parser = require('intl-messageformat-parser');

var locale = require('../lib/locale');

describe('locale', function() {
  locale.getLocaleInfo().forEach(function(info) {
    describe(info.name, function() {
      it('has valid ICU MessageFormat messages', function() {
        var messages = require(info.path);

        Object.keys(messages).forEach(function(name) {
          try {
            parser.parse(messages[name]);
          } catch (e) {
            throw new Error("In message '" + name + "', " + e.message);
          }
        });
      });
    });
  });
});