const path = require('path');
const webpack = require('webpack');
const dotenv = require("dotenv");

module.exports = (env, argv) => {
  dotenv.config({
    path: argv.mode === "production" ? "./env/production.env" : "./env/dev.env"
  });

  return {
    mode: "none",
    entry: './src/client/index.ts',
    devtool: 'inline-source-map',
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }, ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, "public"),
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.SOCKET_URL': JSON.stringify(process.env.SOCKET_URL)
      })
    ]
  }
};