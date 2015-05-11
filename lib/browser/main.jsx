var React = require('react/addons');
var Router = require('react-router');

var messages = require('val!./messages');

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
  var DEFAULT_LOCALE = 'en-US';
  var initialLocale = window.sessionStorage['locale'];
  var availableLocales = Object.keys(messages);

  function handleLocaleChange(locale) {
    window.sessionStorage['locale'] = locale;

    React.render(
      <Handler
       locales={locale}
       messages={messages[locale]}
       onLocaleChange={handleLocaleChange}
       availableLocales={availableLocales} />,
      document.getElementById('app')
    );
  }

  if (!(initialLocale && initialLocale in messages)) {
    initialLocale = DEFAULT_LOCALE;
  }
  handleLocaleChange(initialLocale);
});
