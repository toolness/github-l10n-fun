var React = require('react/addons');
var bs = require('react-bootstrap');

var App = React.createClass({
  render: function() {
    return (
      <div>
        <bs.Navbar staticTop brand="GitHub L10n Fun">
        </bs.Navbar>
        <div className="container">
          <h1>Hello.</h1>
        </div>
      </div>
    );
  }
});

React.render(
  <App/>,
  document.getElementById('app')
);
