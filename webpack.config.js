var webpack = require('webpack');

var PRODUCTION = process.env.NODE_ENV === 'production';

function importEnvVars(keys) {
  var result = {};

  keys.forEach(function(key) {
    if (typeof (process.env[key]) === 'string') {
      result['process.env.' + key] = JSON.stringify(process.env[key]);
    }
  });

  return result;
}

module.exports = {
  entry: './lib/browser/main.jsx',
  devtool: PRODUCTION ? 'source-map' : 'eval',
  module: {
    loaders: [
      { test: /\.jsx$/, loader: 'jsx-loader' }
    ],
  },
  output: {
    path: __dirname + '/static/js',
    publicPath: '/js/',
    filename: '[name].bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin(importEnvVars([
      'NODE_ENV',
      'GITHUB_CLIENT_ID'
    ]))
  ]
};
