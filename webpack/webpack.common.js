const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const entryPoints = {
  content: './src/content/index.tsx',
  background: './src/background/background.ts',
  popup: './src/popup/index.tsx',
  options: './src/options/index.tsx',
  main: './src/index.tsx',
};

module.exports = {
  entry: entryPoints,
  output: {
    filename: `[name]/[name].js`,
    path: path.resolve(__dirname, '../dist'),
    clean: true,
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
    ],
  },
  resolve: {
    alias: {
      '@_locales': path.resolve(__dirname, '../_locales'),
      '@assets': path.resolve(__dirname, '../public/assets'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@hooks': path.resolve(__dirname, '../src/hooks'),
      '@services': path.resolve(__dirname, '../src/services'),
      '@my_types': path.resolve(__dirname, '../src/types'),
      '@utils': path.resolve(__dirname, '../src/utils'),
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
        { from: '_locales', to: '_locales' },
        { from: 'public/assets/images', to: 'assets/images' },
        { from: 'src/assets/icons', to: 'assets/icons' },
        { from: 'src/content/content.css', to: 'content/content.css' },
      ],
    }),
    new CleanWebpackPlugin(),
  ],
};
