var _ = require('underscore');
var React = require('react/addons');
var Router = require('react-router');
var bs = require('react-bootstrap');

var Github = require('../github');
var allLocales = require('../../all-locales.json');

var RepoHome = React.createClass({
  mixins: [Router.State, Router.Navigation],
  getInitialState: function() {
    return {
      locales: []
    };
  },
  fetchLocales: function() {
    var params = this.getParams();
    var branch = this.props.branch;

    if (!branch) return this.setState({locales: []});

    Github.fetchLocaleList({
      owner: params.owner,
      repo: params.repo,
      branch: branch
    }, function(err, locales) {
      if (!this.isMounted()) return;
      if (err)
        return this.props.handleGithubError(
          <span>Unable to list contents of <code>{Github.LOCALE_PATH}</code>.</span>,
          err
        );
      this.setState({locales: locales});
    }.bind(this));
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.transitionTo('repo_locale', _.extend({
      locale: e.target.locale.value
    }, this.getParams()), this.getQuery());
  },
  componentDidMount: function() {
    this.fetchLocales();
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (this.props.branch !== prevProps.branch) {
      this.fetchLocales();
    }
  },
  render: function() {
    var localeMap = {};
    var params = this.getParams();

    this.state.locales.forEach(function(locale) {
      localeMap[locale] = true;
    });

    return (
      <div>
        <h2>Existing Localizations</h2>
        <ul>
          {this.state.locales.map(function(locale) {
            return (
              <li key={locale}>
                <Router.Link to="repo_locale" params={_.extend({
                  locale: locale
                }, params)} query={this.getQuery()}>{locale}</Router.Link>
              </li>
            );
          }, this)}
        </ul>
        <h2>Start A New Localization</h2>
        <form onSubmit={this.handleSubmit}>
          <bs.Input type="select" label="Locale" className="input-sm" name="locale">
            {allLocales.filter(function(locale) {
              return !(locale in localeMap);
            }).map(function(locale) {
              return <option key={locale} value={locale}>{locale}</option>
            })}
          </bs.Input>
          <bs.Button type="submit">Go</bs.Button>
        </form>
      </div>
    );
  }
});

module.exports = RepoHome;
