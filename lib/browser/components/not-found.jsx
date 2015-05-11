var React = require('react/addons');

var LocalizedMsg = require('./localized-msg.jsx');

var NotFound = React.createClass({
  render: function() {
    return (
      <p>
        <LocalizedMsg msgid="not_found"/>
      </p>
    );
  }
});

module.exports = NotFound;
