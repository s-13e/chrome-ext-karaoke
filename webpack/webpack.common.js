const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const entryPoints = {
  content: './src/content/index.tsx',
  background: './src/background/background.ts',
  popup: './src/popup/index.tsx',
  options: './src/options/index.tsx',
};

module.exports = {
  entry: entryPoints,
  output: {
    filename: `[name]/[name].js`,
    path: path.resolve(__dirname, '../dist'),
    clean: false,
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: false,
              importLoaders: 1,
            },
          },
        ],
      },
      {
        test: /\.json$/,
        type: 'javascript/auto', // JSON을 모듈로 처리
        use: ['json-loader'], // ✅ 로더 명시
      },
    ],
  },
  resolve: {
    alias: {
      '@locales': path.resolve(__dirname, '../src/locales'),
      '@assets': path.resolve(__dirname, '../public/assets'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@constants': path.resolve(__dirname, '../src/constants'),
      '@hooks': path.resolve(__dirname, '../src/hooks'),
      '@styles': path.resolve(__dirname, '../src/styles'),
      '@services': path.resolve(__dirname, '../src/services'),
      '@lib': path.resolve(__dirname, '../src/lib'),
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'options/options.html',
      template: './src/options/options.html',
      chunks: ['options'],
      inject: 'body',
      publicPath: '../',
      scriptLoading: 'module',
    }),
    new HtmlWebpackPlugin({
      filename: 'popup/popup.html',
      template: './src/popup/popup.html',
      chunks: ['popup'],
      publicPath: '../',
      scriptLoading: 'module',
      inject: true, // CSS와 JS 자동 주입
    }),
    new MiniCssExtractPlugin({
      filename: ({ chunk }) => `${chunk.name}/style.css`,
    }),
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'public/assets/images', to: 'assets/images' },
        { from: 'src/assets/icons', to: 'assets/icons' },
        { from: 'src/content/content.css', to: 'content/content.css' },
        {
          from: 'src/locales/*.json',
          to: '_locales/[name]/messages.json',
          transform(content) {
            const translations = JSON.parse(content);
            const chromeFormat = {};
            Object.keys(translations).forEach((key) => {
              chromeFormat[key] = { message: translations[key] };
            });
            return JSON.stringify(chromeFormat, null, 2);
          },
        },
      ],
    }),
  ],
};
