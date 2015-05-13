[![Build Status](https://travis-ci.org/toolness/github-l10n-fun.svg?branch=master)](https://travis-ci.org/toolness/github-l10n-fun)

This is a very experimental app that attempts to make
it easy to localize web apps and do L10n workflow through GitHub.

Think [prose.io](http://prose.io/), but for localization.

It currently assumes use of the [ICU Message][] syntax.

## Quick Start

First, [register a GitHub application][github_register] and take
note of its client ID and client secret.

Then clone this repository, `cd` into it and run:

```
npm install
npm test
export GITHUB_CLIENT_ID='your client id'
export GITHUB_CLIENT_SECRET='your client secret'
node app.js
```

Then visit http://localhost:3000/ in your browser.

## Tests

Fully testing the code is accomplished by running `npm test`,
which exercises a number of different aspects of the
codebase described below.

### Unit Tests

Unit tests are spread across two different testing
environments.

Both environments use the [mocha][] test runner and [should][]
for assertions.

#### Node Tests

These tests generally exercise the code of the server and are
located in the `test` directory.

Each test file should end with `.test.js` and will be automatically
discovered by the test runner.

Individually running *only* the node unit tests can be accomplished
via `node_modules/.bin/mocha test/*.test.js`. For more options,
see the documentation for [mocha (1)][].

#### Browser Tests

These tests exercise the code that runs in the user's browser. They're
located in the `test/browser` directory.

Each test file should end with `.test.js` or `.test.jsx` and will be
automatically discovered by the test runner.

Individually running *only* the browser unit tests can be accomplished
by first running `npm start` and then visiting http://localhost:3000/test/
in your browser.



[ICU Message]: http://formatjs.io/guides/message-syntax/
[github_register]: https://github.com/settings/applications/new
[mocha]: http://mochajs.org/
[mocha (1)]: http://mochajs.org/#usage
[should]: https://www.npmjs.com/package/should
