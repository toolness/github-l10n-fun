var _ = require('underscore');
var React = require('react/addons');
var Router = require('react-router');

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

    this.props.githubRequest('GET', '/repos/' + params.owner +
                             '/' + params.repo + '/contents/locale')
      .query({ref: branch})
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
