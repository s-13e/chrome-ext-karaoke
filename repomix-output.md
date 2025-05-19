This file is a merged representation of a subset of the codebase, containing files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose

This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format

The content is organized as follows:

1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
   a. A header with the file path (## File: path/to/file)
   b. The full contents of the file in a code block

## Usage Guidelines

- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes

- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching these patterns are excluded: .gitignore, .gitattributes, dist/, node_modules/, .vscode, README.md, LICENSE
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure

```
_locales/en/messages.json
.github/workflows/ci.yml
.husky/pre-commit
.prettierrc
eslint.config.mjs
jest.config.js
lint-staged.config.js
manifest.json
package.json
public/popup.html
src/popup/App.css
tsconfig.json
webpack/webpack.common.js
webpack/webpack.dev.js
webpack/webpack.prod.js
```

# Files

## File: \_locales/en/messages.json

```json
{}
```

## File: .github/workflows/ci.yml

```yaml
name: CI

on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run format
      - run: npm test
      - run: npm run build
```

## File: .husky/pre-commit

```
npx lint-staged
```

## File: .prettierrc

```
{
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

## File: eslint.config.mjs

```
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import globals from "globals";
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,

  // 전역 변수 & 공통 규칙
  {
    name: 'chrome-extension/base',
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { import: importPlugin },
    rules: {
      'no-console': 'warn',
      'prefer-const': 'error',
      'import/no-default-export': 'error',
      'prettier/prettier': 'error',
    },
  },
  // TypeScript 규칙
  {
    name: 'chrome-extension/typescript',
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tseslint },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
      '@typescript-eslint/naming-convention': 'error',
    },
  },

  // React 규칙
  {
    name: 'chrome-extension/React',
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: { react: reactPlugin },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react/jsx-key': 'error',
      'react/jsx-no-useless-fragment': 'error',
    },
  },
  // React-hooks 규칙칙
  {
    name: 'chrome-extension/react-hooks',
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // jest 규칙
  {
    name: 'chrome-extension/jest',
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  prettier,
];
```

## File: jest.config.js

```javascript
/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // TypeScript 지원
  preset: 'ts-jest',

  testEnvironment: 'jsdom',
  // 소스 코드 위치 (src 폴더 내에서만 테스트)
  roots: ['<rootDir>/src'],

  // 테스트 파일 패턴
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],

  // 지원 파일 확장자
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // 커버리지 리포트 옵션
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // TypeScript 설정 파일 경로
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  transform: {
    '^.+\.tsx?$': ['ts-jest', {}],
    '^.+\\.[jt]sx?$': 'babel-jest', // .js, .jsx, .ts, .tsx 파일은 babel-jest로 변환
  },
};
```

## File: lint-staged.config.js

```javascript
// lint-staged.config.js
module.exports = {
  '*.{js,ts,tsx}': [
    'eslint --fix', // ESLint로 코드 수정
    'prettier --write', // Prettier로 포맷팅
  ],
  '*.md': ['prettier --write'], // 마크다운 파일 포맷팅
};
```

## File: manifest.json

```json
{
  "manifest_version": 3,
  "name": "확장 이름",
  "version": "1.0.0",
  "description": "설명",
  "default_locale": "en",
  "options_ui": {
    "page": "options.html"
  },
  "background": {
    "service_worker": "dist/background/background.js"
  },
  "permissions": ["storage", "activeTab", "webNavigation", "scripting", "tabs"],
  "host_permissions": ["*://*.youtube.com/*"],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Popup name",
    "default_icon": {
      "16": "images/icon-16.png",
      "48": "images/icon-48.png",
      "128": "image/icon-128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["*://*.youtube.com/*"],
      "js": ["content.js"],
      "css": ["dist/content/content.css"],
      "run_at": "document_idle"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": [],
      "matches": ["*://*.youtube.com/*"]
    }
  ],

  "icons": {
    "16": "images/icon-16.png",
    "48": "images/icon-48.png",
    "128": "images/icon-128.png"
  }
}
```

## File: package.json

```json
{
  "devDependencies": {
    "@eslint/js": "^9.26.0",
    "@types/chrome": "^0.0.322",
    "@types/jest": "^29.5.14",
    "@typescript-eslint/eslint-plugin": "^8.32.1",
    "@typescript-eslint/parser": "^8.32.0",
    "eslint": "^9.26.0",
    "eslint-config-prettier": "10.1.5",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "globals": "^16.1.0",
    "husky": "^9.1.7",
    "jest": "^29.7.0",
    "prettier": "3.5.3",
    "ts-jest": "^29.3.2",
    "ts-loader": "^9.5.2",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.32.0",
    "webpack": "^5.99.8",
    "webpack-cli": "^6.0.1"
  },
  "scripts": {
    "build": "webpack --config webpack.prod.js",
    "dev": "webpack --config webpack.dev.js --watch",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,scss,md}\"",
    "test": "jest --coverage",
    "prepare": "husky",
    "clean": "rimraf dist"
  }
}
```

## File: public/popup.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="popup.css" />
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>popup</h1>
        <button class="close-button">×</button>
      </div>

      <div class="nav-menu">
        <div class="nav-item active">
          <img src="../assets/icons/rocket.png" alt="실행" />
          <span>실행</span>
        </div>
        <div class="nav-item">
          <img src="../assets/icons/doc.png" alt="단어장" />
          <span>단어장</span>
        </div>
        <div class="nav-item">
          <img src="../assets/icons/diamond.png" alt="프리미엄" />
          <span>프리미엄</span>
        </div>
        <div class="nav-item settings">
          <img src="../assets/icons/setting.png" alt="설정" />
          <span>설정</span>
        </div>
      </div>
      <div id="content-container"></div>
    </div>
  </body>
</html>
```

## File: src/popup/App.css

```css
body {
  width: 360px;
  height: 500px;
  margin: 0;
  padding: 0;
}
```

## File: tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023", "DOM"],
    "module": "ESNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@assets/*": ["public/assets/*"]
    },
    "types": ["chrome", "jest"],
    "allowJs": true,
    "noUncheckedIndexedAccess": true, // 인덱스 접근 시 undefined 체크 강제화
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noUnusedLocals": true, // 사용하지 않은 변수 에러 처리
    "noUnusedParameters": true, // 사용하지 않은 파라미터 에러 처리
    "noEmit": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## File: webpack/webpack.common.js

```javascript
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

console.log('Webpack output path:', path.resolve(__dirname, 'dist'));

const entryPoints = {
  content: './src/content/index.ts',
  background: './src/background/index.ts',
  popup: './src/popup/index.ts',
};

console.log('Entry points:', entryPoints);

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
```

## File: webpack/webpack.dev.js

```javascript
// webpack.dev.js - 개발 환경
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  target: 'web',
});
```

## File: webpack/webpack.prod.js

```javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        terserOptions: {
          module: true,
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
    concatenateModules: true,
    minimize: true,
  },
});
```
