var React = require('react/addons');
var Router = require('react-router');

var RepoLocale = React.createClass({
  mixins: [Router.State],
  getInitialState: function() {
    return {
      messages: {}
    };
  },
  fetchLocale: function() {
    var params = this.getParams();

    this.props.githubRequest('GET', '/repos/' + params.owner +
                             '/' + params.repo +
                             '/contents/locale/' + params.locale + '.json')
      .end(function(err, res) {
        if (err) {
          return this.props.handleGithubError(
            <span>Unable to fetch messages for locale <code>{params.locale}</code>.</span>,
            err
          );
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

module.exports = RepoLocale;
