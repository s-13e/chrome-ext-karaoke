const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const entryPoints = {
  content: './src/content/index.ts',
  background: './src/background/index.ts',
  popup: './src/popup/index.ts',
};

module.exports = {
  entry: entryPoints,
  output: {
    filename: `[name]/[name].js`,
    path: path.resolve(__dirname, 'dist'),
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
    extensions: ['.ts', 'tsx', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup/popup.html',
      chunks: ['popup'],
      publicPath: '../',
      scriptLoading: 'module',
      inject: true, // CSS와 JS 자동 주입
    }),
    new MiniCssExtractPlugin({
      filename: (pathData) => {
        // 각 청크별로 고유한 CSS 파일명 생성
        return pathData.chunk.name === 'popup'
          ? 'popup/style.css' // popup 폴더 내에 생성
          : `${pathData.chunk.name}/style.css`;
      },
    }),
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/assets/icons', to: 'assets/icons' },
        { from: 'src/assets/images', to: 'assets/images' },
        { from: 'src/popup/pages', to: 'popup/pages' },
        { from: 'src/popup/js', to: 'popup/js', noErrorOnMissing: true },
        { from: 'src/types', to: 'types' },
      ],
    }),
    new CleanWebpackPlugin(),
  ],
};
