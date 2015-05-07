This is an app that attempts to make it easy to localize web
apps and do L10n workflow through GitHub.

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

[github_register]: https://github.com/settings/applications/new
