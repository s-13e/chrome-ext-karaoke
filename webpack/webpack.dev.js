// webpack.dev.js - 개발 환경
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common.js');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// 번들 분석이 필요할 때만 활성화: ANALYZE=true npm run dev
const enableBundleAnalyzer = process.env.ANALYZE === 'true';

const devConfig = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
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
    // 개발 모드 플래그 - production 빌드에서는 이 코드가 포함되지 않음
    new webpack.DefinePlugin({
      'process.env.DEV_MODE': JSON.stringify('true'),
    }),
  ],
};

// 번들 분석 활성화 시에만 플러그인 추가
if (enableBundleAnalyzer) {
  devConfig.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: 'bundle-stats.json',
    }),
  );
}

module.exports = merge(common, devConfig);
