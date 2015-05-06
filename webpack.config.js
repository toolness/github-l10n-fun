var PRODUCTION = process.env.NODE_ENV === 'production';

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
  }
};
