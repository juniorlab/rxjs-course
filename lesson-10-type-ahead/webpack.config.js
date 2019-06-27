const path = require('path');

module.exports = {
  entry: './app/static/script.js',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'app/public'),
    filename: 'bundle.js',
  },
};