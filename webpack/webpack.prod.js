const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common, {
  plugins: [
    // 프로덕션 모드에서는 DEV_MODE 비활성화 - 개발자 전용 기능 숨김
    new webpack.DefinePlugin({
      'process.env.DEV_MODE': JSON.stringify('false'),
    }),
  ],

  mode: 'production',
  devtool: false, // Source map 제거 (디버깅은 console로)

  // Chrome Extension 전용 최적화 설정
  optimization: {
    // ✅ Chrome Extension에서 안전한 옵션들
    minimize: true,
    usedExports: true,

    // ❌ Chrome Extension에서 문제가 되는 옵션들 비활성화
    splitChunks: {
      chunks: 'async', // 'all' 대신 'async'만 (동적 import에만 적용)
      cacheGroups: {
        default: false, // 기본 chunk 분할 비활성화
        vendors: false, // vendor chunk 분할 비활성화
      },
    },
    runtimeChunk: false, // runtime chunk 비활성화 (중요!)
    concatenateModules: false, // scope hoisting 비활성화 (CSP 문제 방지)

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
          // Chrome Extension CSP 호환성
          mangle: {
            eval: false, // eval 사용 방지
          },
          output: {
            comments: false,
          },
        },
      }),
    ],
  },

  // Chrome Extension 전용 output 설정
  output: {
    // globalObject를 'this'로 설정 (window 사용 방지)
    globalObject: 'this',
    // chunk loading 방식 변경
    chunkLoading: false,
    wasmLoading: false,
  },
});
