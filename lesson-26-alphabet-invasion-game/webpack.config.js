const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: [
    './app/static/styles.css',
    './app/static/script.js'
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.css'
    }),
    new CopyPlugin([
      {
        from: 'app/static/favicon.ico',
        to: 'favicon.ico',
        flatten: true,
      }
    ])
  ],
  output: {
    path: path.resolve(__dirname, 'app/public'),
    filename: 'bundle.js',
  },
};
