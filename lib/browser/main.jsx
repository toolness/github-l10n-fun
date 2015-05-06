var querystring = require('querystring');
var React = require('react/addons');
var auth = require('./auth');
var bs = require('react-bootstrap');

var App = React.createClass({
  handleLoginClick: function() {
    auth.startLogin();
  },
  handleLogoutClick: function() {
    auth.logout();
    this.forceUpdate();
  },
  render: function() {
    var username = auth.getUsername();
    var loginBtn = username
      ? <bs.NavItem onClick={this.handleLogoutClick}>Logout {username}</bs.NavItem>
      : <bs.NavItem onClick={this.handleLoginClick}>Login</bs.NavItem>;

    return (
      <div>
        <bs.Navbar staticTop brand="GitHub L10n Fun">
          <bs.Nav right>
            {loginBtn}
          </bs.Nav>
        </bs.Navbar>
        <div className="container">
          <h1>Hello.</h1>
        </div>
      </div>
    );
  }
});

var CompleteLogin = React.createClass({
  getInitialState: function() {
    return {
      err: null
    };
  },
  componentDidMount: function() {
    auth.completeLogin(this.props.code, this.props.state, function(err) {
      if (err) return  this.setState({err: err.message});
      this.props.onSuccess();
    }.bind(this));
  },
  render: function() {
    return (
      <div className="container">
        {this.state.err
         ? <p>An error occurred: {this.state.err}</p>
         : <p>Please wait, authenticating.</p>}
      </div>
    );
  }
});

function main() {
  var qs = querystring.parse(window.location.search.slice(1));
  var content = <App/>;
  var handleLoginSuccess = function() {
    window.history.replaceState({}, "", '/');
    main();
  };

  if (qs.code && qs.state) {
    content = <CompleteLogin code={qs.code} state={qs.state} onSuccess={handleLoginSuccess}/>
  }

  React.render(content, document.getElementById('app'));
}

main();
