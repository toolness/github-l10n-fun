var PRODUCTION = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './lib/browser/main.js',
  devtool: PRODUCTION ? 'source-map' : 'eval',
  output: {
    path: __dirname + '/static/js',
    publicPath: '/js/',
    filename: '[name].bundle.js'
  }
};
