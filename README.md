This is an app that attempts to make it easy to localize web
apps and do L10n workflow through GitHub.

## Quick Start

First, [register a GitHub application][github_register].

Then clone this repository, `cd` into it and run:

```
npm install
npm test
export GITHUB_CLIENT_ID=...
export GITHUB_CLIENT_SECRET=...
node app.js
```

Then visit http://localhost:3000/ in your browser.

[github_register]: https://github.com/settings/applications/new
