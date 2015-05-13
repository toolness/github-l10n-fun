var _ = require('underscore');
var stableStringify = require('json-stable-stringify');
var React = require('react/addons');
var Router = require('react-router');
var bs = require('react-bootstrap');

var Github = require('../github');

var CommitModal = React.createClass({
  getInitialState: function() {
    return {
      commitMessage: ''
    };
  },
  handleChangeCommitMessage: function(e) {
    this.setState({
      commitMessage: e.target.value
    });
  },
  getDefaultCommitMessage: function() {
    return "Added/changed " + this.props.locale + " locale messages.";
  },
  handleSubmit: function(e) {
    var commitMessage = this.state.commitMessage.trim() ||
                        this.getDefaultCommitMessage();
    var messages = stableStringify(
      _.extend({}, this.props.messages, this.props.editedMessages),
      { space: 2 }
    );
    e.preventDefault();
    console.log("Commit message:", commitMessage);
    console.log("Commit contents:", messages);
    alert("Sorry, this hasn't been implemented yet.");
  },
  render: function() {
    var owner = this.props.owner;
    var branch = this.props.branch;
    var locale = this.props.locale;
    var editedMessages = this.props.editedMessages;
    var messageKeys = Object.keys(editedMessages);

    return (
      <bs.Modal {...this.props} title="Commit Changes" bsStyle="primary">
        <div className="modal-body">
          <p>You are about to commit changes into <code>{owner}:{branch}</code> for the <strong>{locale}</strong> locale.</p>
          <p>The following Message IDs will be changed:</p>
          <ul>
            {messageKeys.map(function(id) {
              return <li key={id}><code>{id}</code></li>;
            })}
          </ul>
          <form onSubmit={this.handleSubmit}>
            <bs.Input type="text" placeholder={this.getDefaultCommitMessage()} label="Commit Message (optional)" value={this.state.commitMessage} onChange={this.handleChangeCommitMessage} />
            <bs.Button bsStyle="primary" type="submit">Commit</bs.Button>
          </form>
        </div>
      </bs.Modal>
    );
  }
});

var RepoLocale = React.createClass({
  mixins: [Router.State],
  getInitialState: function() {
    return {
      defaultMessages: {},
      messages: {},
      messagesSHA: null,
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
      }, options), function(err, messages, sha) {
        if (!this.isMounted()) return;
        if (err) {
          sha = null;
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
          messages: messages,
          messagesSHA: sha
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
          <bs.ModalTrigger modal={React.createElement(CommitModal, {
            owner: params.owner,
            branch: this.props.branch,
            messages: messages,
            editedMessages: editedMessages,
            locale: params.locale
          })}>
            <bs.Button bsStyle="primary" disabled={this.canUserCommit() && !messagesChanged}>Commit Changes&hellip;</bs.Button>
          </bs.ModalTrigger>
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
