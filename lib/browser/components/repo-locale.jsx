var _ = require('underscore');
var React = require('react/addons');
var Router = require('react-router');

var Github = require('../github');

var RepoLocale = React.createClass({
  mixins: [Router.State],
  getInitialState: function() {
    return {
      defaultMessages: {},
      messages: {}
    };
  },
  fetchLocale: function() {
    var params = this.getParams();
    var options = {
      owner: params.owner,
      repo: params.repo,
      branch: this.props.branch
    };

    Github.fetchLocaleMessages(options, function(err, defaultMessages) {
      if (!this.isMounted()) return;
      if (err) {
        return this.props.handleGithubError(
          <span>Unable to fetch/parse messages for locale <code>{Github.DEFAULT_LOCALE}</code>.</span>,
          err
        );
      }

      Github.fetchLocaleMessages(_.extend({
        locale: params.locale
      }, options), function(err, messages) {
        if (!this.isMounted()) return;
        if (err) {
          if (err.status === 404) {
            messages = {};
          } else {
            return this.props.handleGithubError(
              <span>Unable to fetch/parse messages for locale <code>{params.locale}</code>.</span>,
              err
            );
          }
        }
        this.setState({
          defaultMessages: defaultMessages,
          messages: messages
        });
      }.bind(this));
    }.bind(this));
  },
  componentDidMount: function() {
    this.fetchLocale();
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (this.props.branch !== prevProps.branch) {
      this.fetchLocale();
    }
  },
  render: function() {
    var params = this.getParams();
    var defaultMessages = this.state.defaultMessages;
    var messages = this.state.messages;
    var isDefaultLocale = (params.locale === Github.DEFAULT_LOCALE);

    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>Message ID</th>
              <th>Original <a target="_blank" href="http://formatjs.io/guides/message-syntax/">ICU MessageFormat</a> Message ({Github.DEFAULT_LOCALE})</th>
              {isDefaultLocale ? null : <th>Localized Message ({params.locale})</th>}
            </tr>
          </thead>
          <tbody>
            {Object.keys(defaultMessages).map(function(name) {
              return (
                <tr key={name}>
                  <td><code>{name}</code></td>
                  <td>{defaultMessages[name]}</td>
                  {isDefaultLocale ? null : <td>{messages[name] || ''}</td>}
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

module.exports = RepoLocale;
