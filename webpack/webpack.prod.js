const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        terserOptions: {
          module: true,
          keep_classnames: true,
          keep_fnames: true,
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
    concatenateModules: true,
    minimize: true,
    usedExports: true,
  },
});
