var React = require('react/addons');

var messages = require('val!../messages');

var LocalizedHandler = React.createClass({
  validLocale: function(locale) {
    if (!(locale && locale in messages)) {
      return this.props.defaultLocale;
    }
    return locale;
  },
  getInitialState: function() {
    return {
      locale: this.validLocale(window.sessionStorage['locale'])
    };
  },
  handleLocaleChange: function(locale) {
    locale = this.validLocale(locale);
    window.sessionStorage['locale'] = locale;
    this.setState({locale: locale});
  },
  render: function() {
    return React.createElement(this.props.handler, {
      locales: this.state.locale,
      messages: messages[this.state.locale],
      onLocaleChange: this.handleLocaleChange,
      availableLocales: Object.keys(messages)
    });
  }
});

module.exports = LocalizedHandler;
