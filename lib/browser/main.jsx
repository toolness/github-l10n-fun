var _ = require('underscore');
var React = require('react/addons');
var ReactIntl = require('react-intl');
var Router = require('react-router');
var bs = require('react-bootstrap');

var auth = require('./auth');
var messages = require('val!./messages');
var githubRequest = require('../github-request');
var PagedEntityStream = require('../paged-entity-stream');

var authGithubRequest = function(method, path) {
  return githubRequest(method, path, auth.getAccessToken());
};

var LocalizedMsg = React.createClass({
  mixins: [ReactIntl.IntlMixin],
  render: function() {
    var message = this.getIntlMessage(this.props.msgid);

    return (
      <ReactIntl.FormattedMessage message={message} {...this.props} />
    );
  }
});

var App = React.createClass({
  mixins: [Router.Navigation, Router.State, ReactIntl.IntlMixin],
  handleLoginClick: function() {
    window.sessionStorage['pre_login_location'] = this.getPathname();
    auth.startLogin(this.makeHref('oauth2_callback'));
  },
  handleLogoutClick: function() {
    auth.logout();
    this.forceUpdate();
  },
  handleLocaleChange: function(e) {
    this.props.onLocaleChange(e.target.value);
  },
  render: function() {
    var username = auth.getUsername();
    var loginBtn = username
      ? <bs.NavItem onClick={this.handleLogoutClick}>
          <LocalizedMsg msgid="logout" username={username}/>
        </bs.NavItem>
      : <bs.NavItem onClick={this.handleLoginClick}>
          <LocalizedMsg msgid="login"/>
        </bs.NavItem>;
    var brandLink = (
      <Router.Link to="/">
        <LocalizedMsg msgid="app_name"/>
      </Router.Link>
    );

    return (
      <div>
        <bs.Navbar staticTop brand={brandLink}>
          <div className="navbar-form navbar-right form-group">
            <select className="form-control" defaultValue={this.props.locales} onChange={this.handleLocaleChange}>
              {this.props.availableLocales.map(function(locale) {
                return <option key={locale} value={locale}>{locale}</option>;
              })}
            </select>
          </div>
          <bs.Nav right>
            {loginBtn}
          </bs.Nav>
        </bs.Navbar>
        <div className="container">
          <Router.RouteHandler/>
        </div>
      </div>
    );
  }
});

var NotFound = React.createClass({
  render: function() {
    return (
      <p>
        <LocalizedMsg msgid="not_found"/>
      </p>
    );
  }
});

var Home = React.createClass({
  render: function() {
    // TODO: Don't hardcode these links.

    return (
      <div>
        <ul>
          <li>
            <Router.Link to="repo_home" params={{
              owner: 'toolness',
              repo: 'github-l10n-fun'
            }}>toolness/github-l10n-fun</Router.Link>
          </li>
        </ul>
      </div>
    );
  }
});

var CompleteLogin = React.createClass({
  mixins: [Router.State, Router.Navigation],
  getInitialState: function() {
    return {
      err: null
    };
  },
  componentDidMount: function() {
    var query = this.getQuery();
    var pathname = window.sessionStorage['pre_login_location'] || '/';
    delete window.sessionStorage['pre_login_location'];

    if (auth.getUsername()) {
      return this.transitionTo(pathname);
    }
    auth.completeLogin(query.code, query.state, function(err) {
      if (err) return  this.setState({err: err.message});
      this.transitionTo(pathname);
    }.bind(this));
  },
  render: function() {
    return (
      <div className="container">
        {this.state.err
         ? <p>An error occurred: {this.state.err}</p>
         : <p>Please wait, authenticating.</p>}
      </div>
    );
  }
});

var Repo = React.createClass({
  mixins: [Router.State],
  render: function() {
    var params = this.getParams();

    return (
      <div>
        <h1>{params.owner}/{params.repo}</h1>
        <Router.RouteHandler/>
      </div>
    );
  }
});

var RepoHome = React.createClass({
  mixins: [Router.State],
  getInitialState: function() {
    return {
      defaultBranch: '',
      branches: [],
      locales: []
    };
  },
  fetchLocales: function() {
    var params = this.getParams();

    authGithubRequest('GET', '/repos/' + params.owner +
                             '/' + params.repo + '/contents/locale')
      .end(function(err, res) {
        if (err) {
          // TODO: Actually do something user-friendly.
          throw err;
        }
        // TODO: Test all kinds of edge cases here.
        var locales = res.body.map(function(info) {
          var match = info.name.match(/^(.+)\.json$/);
          return match[1];
        });
        this.setState({locales: locales});
      }.bind(this));
  },
  fetchBranches: function() {
    var params = this.getParams();
    var branches = [];
    var baseURL = '/repos/' + params.owner + '/' + params.repo;

    // TODO: Handle error event.
    var stream = new PagedEntityStream({
      url: baseURL + '/branches',
      request: authGithubRequest
    }).on('data', function(branch) {
      branches.push(branch);
    }).on('end', function() {
      authGithubRequest('GET', baseURL).end(function(err, res) {
        if (err) {
          // TODO: Actually do something user-friendly.
          throw err;
        }
        // TODO: Test all kinds of edge cases here.
        this.setState({
          branches: branches,
          defaultBranch: res.body.default_branch
        });
      }.bind(this));
    }.bind(this));
  },
  componentDidMount: function() {
    this.fetchBranches();
    this.fetchLocales();
  },
  render: function() {
    var params = this.getParams();

    return (
      <div>
        <bs.Input type="select" label="Branch" className="input-sm" value={this.state.defaultBranch}>
          {this.state.branches.map(function(branch) {
            return (
              <option key={branch.name} value={branch.name}>
                {branch.name}
              </option>
            );
          })}
        </bs.Input>
        <ul>
          {this.state.locales.map(function(locale) {
            return (
              <li key={locale}>
                <Router.Link to="repo_locale" params={_.extend({
                  locale: locale
                }, params)}>{locale}</Router.Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
});

var RepoLocale = React.createClass({
  mixins: [Router.State],
  getInitialState: function() {
    return {
      messages: {}
    };
  },
  fetchLocale: function() {
    var params = this.getParams();

    authGithubRequest('GET', '/repos/' + params.owner +
                             '/' + params.repo +
                             '/contents/locale/' + params.locale + '.json')
      .end(function(err, res) {
        if (err) {
          // TODO: Actually do something user-friendly.
          throw err;
        }
        // TODO: Test all kinds of edge cases here.
        var messages = JSON.parse(
          new Buffer(res.body.content, 'base64').toString('utf-8')
        );
        this.setState({messages: messages});
      }.bind(this));
  },
  componentDidMount: function() {
    this.fetchLocale();
  },
  render: function() {
    var params = this.getParams();
    var messages = this.state.messages;

    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Message ID</th>
              <th><a target="_blank" href="http://formatjs.io/guides/message-syntax/">ICU MessageFormat</a> Content</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(messages).map(function(name) {
              return (
                <tr key={name}>
                  <td><code>{name}</code></td>
                  <td>{messages[name]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Router.Link to="repo_home" params={params} className="btn btn-default">
          <span className="glyphicon glyphicon-menu-left"/> Back
        </Router.Link>
      </div>
    );
  }
});

var routes = (
  <Router.Route handler={App} path="/">
    <Router.DefaultRoute handler={Home}/>
    <Router.Route name="oauth2_callback" path="callback" handler={CompleteLogin}/>
    <Router.Route path="/:owner/:repo/" handler={Repo}>
      <Router.DefaultRoute name="repo_home" handler={RepoHome}/>
      <Router.Route name="repo_locale" path=":locale/" handler={RepoLocale}/>
    </Router.Route>
    <Router.NotFoundRoute handler={NotFound}/>
  </Router.Route>
);

Router.run(routes, Router.HistoryLocation, function(Handler) {
  var DEFAULT_LOCALE = 'en-US';
  var initialLocale = window.sessionStorage['locale'];
  var availableLocales = Object.keys(messages);

  function handleLocaleChange(locale) {
    window.sessionStorage['locale'] = locale;

    React.render(
      <Handler
       locales={locale}
       messages={messages[locale]}
       onLocaleChange={handleLocaleChange}
       availableLocales={availableLocales} />,
      document.getElementById('app')
    );
  }

  if (!(initialLocale && initialLocale in messages)) {
    initialLocale = DEFAULT_LOCALE;
  }
  handleLocaleChange(initialLocale);
});
