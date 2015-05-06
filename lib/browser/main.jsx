var React = require('react/addons');
var Router = require('react-router');
var auth = require('./auth');
var bs = require('react-bootstrap');

var App = React.createClass({
  mixins: [Router.Navigation, Router.State],
  handleLoginClick: function() {
    window.sessionStorage['pre_login_location'] = this.getPathname();
    auth.startLogin(this.makeHref('oauth2_callback'));
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
    var brandLink = <Router.Link to="/">GitHub L10n Fun</Router.Link>;

    return (
      <div>
        <bs.Navbar staticTop brand={brandLink}>
          <bs.Nav right>
            {loginBtn}
          </bs.Nav>
        </bs.Navbar>
        <div className="container">
          <Router.RouteHandler/>
        </div>
      </div>
    );
  }
});

var NotFound = React.createClass({
  render: function() {
    return <p>Not found.</p>;
  }
});

var Home = React.createClass({
  render: function() {
    return <p>Sup.</p>;
  }
});

var CompleteLogin = React.createClass({
  mixins: [Router.State, Router.Navigation],
  getInitialState: function() {
    return {
      err: null
    };
  },
  componentDidMount: function() {
    var query = this.getQuery();
    var pathname = window.sessionStorage['pre_login_location'] || '/';
    delete window.sessionStorage['pre_login_location'];

    if (auth.getUsername()) {
      return this.transitionTo(pathname);
    }
    auth.completeLogin(query.code, query.state, function(err) {
      if (err) return  this.setState({err: err.message});
      this.transitionTo(pathname);
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

var routes = (
  <Router.Route handler={App} path="/">
    <Router.DefaultRoute handler={Home}/>
    <Router.Route name="oauth2_callback" path="callback" handler={CompleteLogin}/>
    <Router.NotFoundRoute handler={NotFound}/>
  </Router.Route>
);

Router.run(routes, Router.HistoryLocation, function(Handler) {
  React.render(<Handler/>, document.getElementById('app'));
});
