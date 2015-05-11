var React = require('react/addons');
var ReactIntl = require('react-intl');
var Router = require('react-router');
var bs = require('react-bootstrap');

var LocalizedMsg = require('./localized-msg.jsx');
var auth = require('../auth');
var githubRequest = require('../../github-request');

var authGithubRequest = function(method, path) {
  return githubRequest(method, path, auth.getAccessToken());
};

var App = React.createClass({
  mixins: [
    Router.Navigation,
    Router.State,
    ReactIntl.IntlMixin
  ],
  handleLoginClick: function() {
    if (auth.getUsername()) return;
    window.sessionStorage['pre_login_location'] = this.getPath();
    return auth.startLogin(this.makeHref('oauth2_callback'));
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
          <Router.RouteHandler
           githubRequest={authGithubRequest}
           onLogin={this.handleLoginClick} />
        </div>
      </div>
    );
  }
});

module.exports = App;
