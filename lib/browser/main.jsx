var React = require('react/addons');
var Router = require('react-router');

var LocalizedHandler = require('./components/localized-handler');

var routes = (
  <Router.Route handler={require('./components/app.jsx')} path="/">
    <Router.DefaultRoute handler={require('./components/home.jsx')}/>
    <Router.Route name="oauth2_callback" path="callback"
     handler={require('./components/complete-login.jsx')}/>
    <Router.Route path="/:owner/:repo"
     handler={require('./components/repo.jsx')}>
      <Router.DefaultRoute name="repo_home"
       handler={require('./components/repo-home.jsx')}/>
      <Router.Route name="repo_locale" path=":locale"
       handler={require('./components/repo-locale.jsx')}/>
    </Router.Route>
    <Router.NotFoundRoute handler={require('./components/not-found.jsx')}/>
  </Router.Route>
);

Router.run(routes, Router.HistoryLocation, function(Handler) {
  React.render(<LocalizedHandler defaultLocale="en" handler={Handler}/>,
               document.getElementById('app'));
});
