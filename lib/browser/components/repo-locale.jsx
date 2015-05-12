var React = require('react/addons');
var Router = require('react-router');

var Github = require('../github');

var RepoLocale = React.createClass({
  mixins: [Router.State],
  getInitialState: function() {
    return {
      messages: {}
    };
  },
  fetchLocale: function() {
    var params = this.getParams();

    Github.fetchLocaleMessages({
      owner: params.owner,
      repo: params.repo,
      branch: this.props.branch,
      locale: params.locale
    }, function(err, messages) {
      if (!this.isMounted()) return;
      if (err)
        return this.props.handleGithubError(
          <span>Unable to fetch/parse messages for locale <code>{params.locale}</code>.</span>,
          err
        );
      this.setState({messages: messages});
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

module.exports = RepoLocale;
