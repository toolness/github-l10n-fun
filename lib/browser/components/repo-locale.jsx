var _ = require('underscore');
var React = require('react/addons');
var Router = require('react-router');

var Github = require('../github');

var RepoLocale = React.createClass({
  mixins: [Router.State],
  getInitialState: function() {
    return {
      defaultMessages: {},
      messages: {},
      editedMessages: {}
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
  handleChangeMessage: function(name, e) {
    var edits = {};
    edits[name] = e.target.value;
    this.setState({
      editedMessages: _.extend({}, this.state.editedMessages, edits)
    });
  },
  handleClickCommit: function(e) {
    window.alert("Sorry, this hasn't been implemented yet.");
  },
  canUserCommit: function() {
    var permissions = this.props.repoData.permissions;
    if (!permissions) return false;
    return permissions.push;
  },
  render: function() {
    var params = this.getParams();
    var defaultMessages = this.state.defaultMessages;
    var messages = this.state.messages;
    var editedMessages = this.state.editedMessages;
    var isDefaultLocale = (params.locale === Github.DEFAULT_LOCALE);
    var isLoggedIn = !!this.props.username;
    var messagesChanged = Object.keys(editedMessages).some(function(name) {
      return (editedMessages[name] !== messages[name]);
    });
    var actions = null;

    if (isLoggedIn) {
      actions = (
        <div style={{paddingBottom: '1em'}}>
          <button className="btn btn-primary" disabled={this.canUserCommit() && !messagesChanged} onClick={this.handleClickCommit}>Commit Changes</button>
        </div>
      );
    }

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
              var message = editedMessages[name] || messages[name] || '';
              var widget;

              if (isLoggedIn) {
                widget = <input type="text" className="form-control" onChange={this.handleChangeMessage.bind(this, name)} value={message}/>;
              } else {
                widget = message;
              }

              return (
                <tr key={name}>
                  <td><code>{name}</code></td>
                  <td>{defaultMessages[name]}</td>
                  {isDefaultLocale ? null : <td>{widget}</td>}
                </tr>
              );
            }, this)}
          </tbody>
        </table>
        {actions}
        <Router.Link to="repo_home" params={params} className="btn btn-default">
          <span className="glyphicon glyphicon-menu-left"/> Back
        </Router.Link>
      </div>
    );
  }
});

module.exports = RepoLocale;
