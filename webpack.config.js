const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = {
  mode: "production",
  target: "node",
  entry: {
    'smart-home-api': "./src/api.ts",
  },
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "./dist"),
  },
}
