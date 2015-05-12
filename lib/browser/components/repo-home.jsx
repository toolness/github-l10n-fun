var _ = require('underscore');
var React = require('react/addons');
var Router = require('react-router');

var Github = require('../github');

var RepoHome = React.createClass({
  mixins: [Router.State],
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
  componentDidMount: function() {
    this.fetchLocales();
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (this.props.branch !== prevProps.branch) {
      this.fetchLocales();
    }
  },
  render: function() {
    var params = this.getParams();

    return (
      <div>
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

module.exports = RepoHome;
