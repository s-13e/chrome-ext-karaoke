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
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'options/options.html',
      template: './src/options/options.html',
      chunks: ['options'],
      inject: 'body',
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
      filename: (pathData) => {
        return pathData.chunk.name === 'popup'
          ? 'popup/style.css' // popup 폴더 내에 생성
          : `${pathData.chunk.name}/style.css`;
      },
    }),
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: '_locales', to: '_locales' },
        { from: 'public/assets/images', to: 'assets/images' },
        { from: 'src/content/content.css', to: 'content/content.css' },
      ],
    }),
    new CleanWebpackPlugin(),
  ],
};
