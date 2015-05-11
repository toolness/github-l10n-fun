var React = require('react/addons');
var Router = require('react-router');

var auth = require('../auth');

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

module.exports = CompleteLogin;
