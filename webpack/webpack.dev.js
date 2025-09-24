// webpack.dev.js - 개발 환경
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'web',

  // Chrome Extension 전용 개발 설정
  optimization: {
    // 개발 환경에서는 chunk 분할 완전 비활성화
    splitChunks: {
      chunks: 'async',
      cacheGroups: {
        default: false,
        vendors: false,
      },
    },
    runtimeChunk: false,
  },

  // Chrome Extension 전용 output 설정
  output: {
    globalObject: 'this',
    chunkLoading: false,
    wasmLoading: false,
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // 빌드 결과를 HTML 파일로 생성
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: 'bundle-stats.json',
    }),
  ],
});
