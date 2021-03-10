const path = require("path");
const webpack = require('webpack');
const dotenv = require("dotenv");

module.exports = (env, argv) => {
  dotenv.config({
    path: argv.mode === "production" ? "./env/production.env" : "./env/dev.env"
  });

	return {
		target: "node",
		mode: "none",
		entry: "./src/server/index.ts",
		devtool: "inline-source-map",
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: "ts-loader",
					exclude: /node_modules/,
				},
			],
		},
		resolve: {
			extensions: [".tsx", ".ts", ".js"],
		},
		output: {
			filename: "index.js",
			path: path.resolve(__dirname, "build"),
		},
    plugins: [
      new webpack.DefinePlugin({
        'process.env.SOCKET_URL': process.env.SOCKET_URL
      })
    ]
	};
};
