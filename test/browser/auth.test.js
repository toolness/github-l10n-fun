var should = require('should');

var auth = require('../../lib/browser/auth');

describe("auth", function() {
  it("logout() removes sessionStorage keys", function() {
    window.sessionStorage.username = 'foo';
    window.sessionStorage.accessToken = 'blah';

    auth.logout();

    should(window.sessionStorage.username).equal(undefined);
    should(window.sessionStorage.accessToken).equal(undefined);
  });
});
