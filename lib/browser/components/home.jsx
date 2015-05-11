var React = require('react/addons');
var Router = require('react-router');

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

module.exports = Home;
