require('es5-shim');

if (process.env.NODE_ENV === 'production') {
  describe("automated test suite", function() {
    it("does not run when NODE_ENV is 'production'", function() {
      console.log(
        "React's TestUtils aren't available when NODE_ENV is set " +
        "to production, so there's not really any point in running " +
        "the tests. For more information, see:\n\n" +
        "https://facebook.github.io/react/downloads.html#npm"
      );
    });
  });
} else {
  require('val!./find-tests.js');
}
