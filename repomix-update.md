This file is a merged representation of the entire codebase, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:

1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:

- File path as an attribute
- Full contents of the file
  </file_format>

<usage_guidelines>

- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
  </usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
\_locales/en/messages.json
\_locales/ko/messages.json
.gitattributes
.github/workflows/ci.yml
.gitignore
.husky/pre-commit
.prettierrc
eslint.config.mjs
eslint/eslint.config.dev.mjs
eslint/eslint.config.prod.mjs
jest.config.js
LICENSE
lint-staged.config.js
manifest.json
package.json
README.md
repomix-output.md
src/App.tsx
src/background/background.ts
src/content/App.tsx
src/content/index.tsx
src/hooks/useChromeStorage.ts
src/i18n/i18n.ts
src/i18n/useLangLoader.ts
src/index.tsx
src/options/App.tsx
src/options/index.tsx
src/options/Options.css
src/options/options.html
src/payment/pay.txt
src/popup/App.tsx
src/popup/index.tsx
src/popup/popup.css
src/popup/popup.html
tsconfig.json
webpack/webpack.common.js
webpack/webpack.dev.js
webpack/webpack.prod.js
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="src/hooks/useChromeStorage.ts">
// src/hooks/useChromeStorage.ts
import { useState, useEffect } from 'react';

export function useChromeStorage<T>(key: string, defaultValue: T) {
const [value, setValue] = useState<T>(defaultValue);
const [isLoading, setIsLoading] = useState(true);

// 저장된 값 불러오기
useEffect(() => {
chrome.storage.sync.get([key], (result) => {
const storedValue = result[key] ?? defaultValue;
setValue(storedValue);
setIsLoading(false);
});
}, [key, defaultValue]);

// 값 저장하기
const setStoredValue = (newValue: T) => {
setValue(newValue);
chrome.storage.sync.set({ [key]: newValue });
};

return [value, setStoredValue, isLoading] as const;
}
</file>

<file path=".gitattributes">
* text eol=lf
</file>

<file path=".github/workflows/ci.yml">
name: CI

on: [push, pull_request]

jobs:
build-and-test:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v4 - uses: actions/setup-node@v4
with:
node-version: 20 - run: npm ci - run: npm run lint - run: npm run format - run: npm test - run: npm run build
</file>

<file path=".husky/pre-commit">
npx lint-staged
</file>

<file path=".prettierrc">
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
</file>

<file path="eslint/eslint.config.prod.mjs">
import base from '../eslint.config.mjs';

export default [
...base,
{
rules: {
'no-console': 'error',
'no-debugger': 'error',
},
},
];
</file>

<file path="jest.config.js">
/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // TypeScript 지원
  preset: 'ts-jest',

testEnvironment: 'jsdom',
// 소스 코드 위치 (src 폴더 내에서만 테스트)
roots: ['<rootDir>/src'],

// 테스트 파일 패턴
testMatch: ['\*_/?(_.)+(spec|test).[jt]s?(x)'],

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
'^.+\\.tsx?$': ['ts-jest', {}], // ✅ `.tsx?`를 정확히 매칭
    '^.+\\.[jt]sx?$': 'babel-jest', // .js, .jsx, .ts, .tsx 파일은 babel-jest로 변환
},
};
</file>

<file path="LICENSE">
MIT License

Copyright (c) 2025 13e

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
</file>

<file path="repomix-output.md">
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

</file>

<file path="src/payment/pay.txt">
나중에 하셈.
ExtensionPay 로 구현할 예정
추후 사용자 모이면 그때 구현 시도해보기
</file>

<file path="webpack/webpack.dev.js">
// webpack.dev.js - 개발 환경
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
mode: 'development',
devtool: 'inline-source-map',
target: 'web',
});
</file>

<file path="webpack/webpack.prod.js">
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
</file>

<file path="_locales/ko/messages.json">
{
  "extName": {
    "message": "마켓 플레이스에 뜨는 제목"
  },
  "extDescription": {
    "message": "여기에 설명 적으셈"
  },
  "language": {
    "message": "언어"
  }
}
</file>

<file path=".gitignore">
# summary
repomix-output.xml

# Logs

logs
_.log
npm-debug.log_
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)

report.[0-9]_.[0-9]_.[0-9]_.[0-9]_.json

# Runtime data

pids
_.pid
_.seed
\*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover

lib-cov

# Coverage directory used by tools like istanbul

coverage
\*.lcov

# nyc test coverage

.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)

.grunt

# Bower dependency directory (https://bower.io/)

bower_components

# node-waf configuration

.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)

build/Release

# Dependency directories

node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)

web_modules/

# TypeScript cache

\*.tsbuildinfo

# Optional npm cache directory

.npm

# Optional eslint cache

.eslintcache

# Optional stylelint cache

.stylelintcache

# Microbundle cache

.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history

.node_repl_history

# Output of 'npm pack'

\*.tgz

# Yarn Integrity file

.yarn-integrity

# dotenv environment variable files

.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# parcel-bundler cache (https://parceljs.org/)

.cache
.parcel-cache

# Next.js build output

.next
out

# Nuxt.js build / generate output

.nuxt
dist

# Gatsby files

.cache/

# Comment in the public line in if your project uses Gatsby and not Next.js

# https://nextjs.org/blog/next-9-1#public-directory-support

# public

# vuepress build output

.vuepress/dist

# vuepress v2.x temp and cache directory

.temp
.cache

# vitepress build output

\*\*/.vitepress/dist

# vitepress cache directory

\*\*/.vitepress/cache

# Docusaurus cache and generated files

.docusaurus

# Serverless directories

.serverless/

# FuseBox cache

.fusebox/

# DynamoDB Local files

.dynamodb/

# TernJS port file

.tern-port

# Stores VSCode versions used for testing VSCode extensions

.vscode-test

# yarn v2

.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.\*
</file>

<file path="eslint/eslint.config.dev.mjs">
import base from '../eslint.config.mjs';

export default [
...base,
{
settings: {
react: {
version: 'detect',
},
},
rules: {
'no-console': 'warn',
'no-debugger': 'warn',
},
},
];
</file>

<file path="lint-staged.config.js">
// lint-staged.config.js
module.exports = {
  '*.{js,ts,tsx}': [
    'eslint --config ./eslint/eslint.config.dev.mjs --fix', // 커밋 시 개발용 규칙 사용
    'prettier --write', // Prettier로 포맷팅
  ],
  '*.md': ['prettier --write'], // 마크다운 파일 포맷팅
};
</file>

<file path="README.md">
# chrome-ext-ts-template

##

## Credits

- Setting icon by [feen] from [Freepik](https://www.freepik.com/icon/setting_2697857).  
  Free for personal and commercial use with attribution.

- [Icon 이름] by [저작자] ([라이선스], [원본 링크])
  </file>

<file path="src/content/index.tsx">
// src/content/index.tsx
// import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const root = document.createElement('div');
root.id = 'chrome-extension-root';
document.body.appendChild(root);

createRoot(root).render(<App />);
</file>

<file path="src/i18n/useLangLoader.ts">
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useLangLoader() {
const { i18n } = useTranslation();
const [isLangLoaded, setIsLangLoaded] = useState(false);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
chrome.storage.sync.get('language', (result) => {
const savedLang = result.language || 'en';
i18n
.changeLanguage(savedLang)
.then(() => {
setIsLangLoaded(true);
document.body.setAttribute('data-lang-loaded', 'true');
})
.catch((err) => {
setError(err); // 에러 발생 시 상태 업데이트
})
.finally(() => {
setLoading(false); // 로딩 완료 (성공/실패 무관)
});
});
}, [i18n]);

return { isLangLoaded, loading, error }; // 객체로 상태 반환
}
</file>

<file path="src/index.tsx">
//import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './i18n/i18n';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
</file>

<file path="src/options/index.tsx">
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '../i18n/i18n';

const root = document.getElementById('root');
if (root) {
createRoot(root).render(<App />);
}
</file>

<file path="tsconfig.json">
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": [
      "ES2023",
      "DOM"
    ],
    "module": "ESNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "src/*"
      ],
      "@assets/*": [
        "public/assets/*"
      ]
    },
    "types": [
      "chrome",
      "jest"
    ],
    "allowJs": true,
    "noUncheckedIndexedAccess": true, // 인덱스 접근 시 undefined 체크 강제화
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noUnusedLocals": true, // 사용하지 않은 변수 에러 처리
    "noUnusedParameters": true, // 사용하지 않은 파라미터 에러 처리
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
</file>

<file path="_locales/en/messages.json">
{
  "extName": {
    "message": "Chrome Extension Templet"
  },
  "extDescription": {
    "message": "jot that down description"
  },
  "language":{
    "message": "Language"
  }
}
</file>

<file path="eslint.config.mjs">
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginReact from 'eslint-plugin-react'; // 이름 변경
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import importPlugin from 'eslint-plugin-import';

// CommonJS 변수 모방 (필수)
const **filename = fileURLToPath(import.meta.url);
const **dirname = path.dirname(\_\_filename);

const compat = new FlatCompat({
baseDirectory: \_\_dirname,
recommendedConfig: js.configs.recommended, // 기본 추천 설정
});

export default [
js.configs.recommended,
...compat.extends('plugin:import/recommended'),
...compat.extends('plugin:react/recommended'),

// 전역 변수 & 공통 규칙
{
name: 'chrome-extension/base',
files: ['**/*.{js,ts,jsx,tsx}'],
plugins: {
import: importPlugin,
prettier: prettierPlugin, // ✅ 추가
},
rules: {
'prefer-const': 'error',
'import/no-default-export': 'error',
'prettier/prettier': 'error',
},
languageOptions: {
ecmaVersion: 2022,
sourceType: 'module',
globals: {
...globals.browser,
...globals.node,
chrome: 'readonly', // 크롬 확장용
},
},
settings: {
'import/resolver': {
typescript: { alwaysTryTypes: true },
},
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
'@typescript-eslint/naming-convention': [
'error',
// 기본 변수/함수: camelCase
{
selector: ['variable', 'function'],
format: ['camelCase'],
},
{
selector: ['function', 'method'],
modifiers: ['exported'],
format: ['camelCase'],
filter: {
regex: '^use[A-Z]',
match: true,
},
},
{
selector: ['function', 'class'],
modifiers: ['exported'],
format: ['PascalCase'],
filter: {
regex: '^use[A-Z]',
match: false,
},
},
],
},
},

// React 규칙
{
name: 'chrome-extension/React',
files: ['**/*.tsx', '**/*.jsx'],
plugins: {
react: pluginReact,
},
settings: {
react: {
version: 'detect',
},
},
rules: {
...pluginReact.configs.recommended.rules,
'react/jsx-key': 'error',
'react/jsx-no-useless-fragment': 'error',
'react/react-in-jsx-scope': 'off',
},
},
// React-hooks 규칙칙
{
name: 'chrome-extension/react-hooks',
files: ['**/*.tsx', '**/*.jsx'],
plugins: {
'react-hooks': reactHooks,
},
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
prettierConfig,
];
</file>

<file path="package.json">
{
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.1",
    "@eslint/js": "^9.26.0",
    "@types/chrome": "^0.0.322",
    "@types/jest": "^29.5.14",
    "@types/react": "^19.1.4",
    "@types/react-dom": "^19.1.5",
    "@typescript-eslint/eslint-plugin": "^8.32.1",
    "@typescript-eslint/parser": "^8.32.0",
    "clean-webpack-plugin": "^4.0.0",
    "copy-webpack-plugin": "^13.0.0",
    "css-loader": "^7.1.2",
    "css-minimizer-webpack-plugin": "^7.0.2",
    "eslint": "^9.26.0",
    "eslint-config-prettier": "^10.1.5",
    "eslint-import-resolver-typescript": "^4.3.5",
    "eslint-plugin-import": "^2.31.0",
    "eslint-plugin-prettier": "^5.4.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-hooks": "^5.2.0",
    "globals": "^16.1.0",
    "html-webpack-plugin": "^5.6.3",
    "husky": "^9.1.7",
    "jest": "^29.7.0",
    "mini-css-extract-plugin": "^2.9.2",
    "prettier": "3.5.3",
    "style-loader": "^4.0.0",
    "ts-jest": "^29.3.2",
    "ts-loader": "^9.5.2",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.32.0",
    "webpack": "^5.99.8",
    "webpack-cli": "^6.0.1"
  },
  "scripts": {
    "build": "webpack --config webpack/webpack.prod.js",
    "dev": "webpack --config webpack/webpack.dev.js --watch",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "lint:dev": "eslint --config ./eslint/eslint.config.dev.mjs src",
    "lint:prod": "eslint --config ./eslint/eslint.config.prod.mjs src",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,scss,md}\"",
    "test": "jest --coverage",
    "prepare": "husky",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "i18next": "^25.2.1",
    "i18next-browser-languagedetector": "^8.1.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-i18next": "^15.5.2"
  }
}
</file>

<file path="src/App.tsx">
// src/App.tsx
//import { useTranslation } from 'react-i18next';
import { useLangLoader } from './i18n/useLangLoader';

export function App() {
const isLangLoaded = useLangLoader();

if (!isLangLoaded) return null;

return null;
}
</file>

<file path="src/background/background.ts">
// 예시: 백그라운드 스크립트
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});
// 특정 페이지에서만 툴바의 아이콘(버튼)이 보이도록 하려함
</file>

<file path="src/content/App.tsx">
// src/content/App.tsx
import React from 'react';

export function App() {
React.useEffect(() => {
// 콘텐츠 스크립트 동작
console.log('콘텐츠 스크립트가 실행됨!');
document.body.style.border = '5px solid red';
}, []);

return null;
}
</file>

<file path="src/options/Options.css">
.custom-select {
  border: none;
  background: transparent;
  font-size: 1rem;
  padding: 4px 8px;
  outline: none;
  /* 필요하다면 width, color 등도 추가 */
}
css
/* 팝업, 옵션 공통 CSS */
body:not([data-lang-loaded]) {
  opacity: 0;
}

body[data-lang-loaded] {
opacity: 1;
transition: opacity 0.3s;
}
</file>

<file path="src/options/options.html">
<!-- options.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Options</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
</file>

<file path="src/i18n/i18n.ts">
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
//import LanguageDetector from 'i18next-browser-languagedetector';

import enRaw from '../../\_locales/en/messages.json';
import koRaw from '../../\_locales/ko/messages.json';

function convertMessages(raw: Record<string, { message?: string }>) {
const result: Record<string, string> = {};
Object.keys(raw).forEach((key) => {
result[key] = raw[key]?.message || '';
});
return result;
}

const resources = {
en: { translation: convertMessages(enRaw) },
ko: { translation: convertMessages(koRaw) },
};

// ✅ 저장된 언어를 먼저 읽고 초기화
export const initializeI18n = async () => {
return new Promise((resolve) => {
chrome.storage.sync.get('language', (result) => {
const savedLang = result.language || 'en';
i18n
.use(initReactI18next)
.init({
resources,
lng: savedLang, // 저장된 언어로 초기화
fallbackLng: 'en',
interpolation: { escapeValue: false },
react: { useSuspense: false },
})
.then(resolve);
});
});
};
export const i18nInstance = i18n;
</file>

<file path="src/options/App.tsx">
// options/App.tsx
import React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Options.css';

export function App() {
const { t, i18n } = useTranslation();
const [currentLang, setCurrentLang] = useState('en');
const [isLangLoaded, setIsLangLoaded] = useState(false);

// 초기 언어 로드 (useLangLoader 대신 직접 구현)
useEffect(() => {
chrome.storage.sync.get('language', (result) => {
const savedLang = result.language || 'en';
i18n.changeLanguage(savedLang).then(() => {
setCurrentLang(savedLang);
setIsLangLoaded(true);
});
});
}, [i18n]);

// 언어 변경 핸들러
const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
const newLang = e.target.value;
await i18n.changeLanguage(newLang);
setCurrentLang(newLang);
chrome.storage.sync.set({ language: newLang });
};

if (!isLangLoaded) return null;

return (
<div>
<h1>{t('language')}</h1>
<select onChange={handleChange} value={currentLang} className="custom-select">
<option value="ko">한국어</option>
<option value="en">English</option>
</select>
<div></div>
</div>
);
}
</file>

<file path="src/popup/index.tsx">
// src/content/index.tsx
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initializeI18n } from '../i18n/i18n';
import React from 'react';

// ✅ i18n 초기화 후에만 앱 렌더링
initializeI18n().then(() => {
const root = createRoot(document.getElementById('root')!);
root.render(
<React.StrictMode>
<App />
</React.StrictMode>,
);
});
</file>

<file path="src/popup/popup.css">
body {
  width: 300px;
  height: 500px;
  margin: 0;
  padding: 10px;
}
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 또는 button에 margin-left: auto */
}
.icon-button {
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;           /* 마우스 오버 시 포인터 */
  outline: none;             /* 포커스 테두리 제거 (접근성 필요시 조정) */
  display: inline-flex;      /* 아이콘 정렬에 유리 */
  align-items: center;
  justify-content: center;
}
/* switch button */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}
.switch input { display: none; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  border-radius: 22px;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 2px; bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}
input:checked + .slider {
  background-color: #2196F3;
}
input:checked + .slider:before {
  transform: translateX(18px);
}
</file>

<file path="src/popup/popup.html">
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body>
    <div id="root"></div>
</body>
</html>
</file>

<file path="manifest.json">
{
  "manifest_version": 3,
  "name": "__MSG_extName__",
  "version": "1.0.0",
  "description": "__MSG_extDescription__",
  "default_locale": "en",
  "options_ui": {
    "page": "options/options.html",
    "open_in_tab": true
  },
  "background": {
    "service_worker": "background/background.js"
  },
  "permissions": ["storage", "activeTab", "webNavigation", "scripting", "tabs"],
  "host_permissions": ["*://*.youtube.com/*"],
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "Popup name",
    "default_icon": {
      "16": "assets/images/icon-16.png",
      "48": "assets/images/icon-48.png",
      "128": "assets/images/icon-128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content.js"],
      "css": ["content/content.css"],
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
    "16": "assets/images/icon-16.png",
    "48": "assets/images/icon-48.png",
    "128": "assets/images/icon-128.png"
  }
}
</file>

<file path="webpack/webpack.common.js">
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
path: path.resolve(\_\_dirname, '../dist'),
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
</file>

<file path="src/popup/App.tsx">
// poup/App.tsx
import './popup.css';
import { useLangLoader } from '../i18n/useLangLoader';
// import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChromeStorage } from '../hooks/useChromeStorage';

export function App() {
const { t } = useTranslation();
const { isLangLoaded, loading, error } = useLangLoader(); // 구조 분해 할당
const [enabled, setEnabled, isEnabledLoading] = useChromeStorage<boolean>('switchState', false);

// 설정 버튼 클릭 시 옵션 페이지 열기
const handleOpenOptions = () => {
if (chrome.runtime.openOptionsPage) {
chrome.runtime.openOptionsPage();
} else {
// 구버전 브라우저 호환
window.open(chrome.runtime.getURL('options.html'));
}
};

if (loading || isEnabledLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (!isLangLoaded) return <div>Language not loaded</div>;

return (
<div>
<div className="popup-header">
<h2>{t('extName')}</h2>
<button id="go-to-options" className="icon-button" onClick={handleOpenOptions}>
<img src="../assets/icons/setting.png" alt="설정" width={24} height={24} />
</button>
</div>
<div>
<label className="switch">
<input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
<span className="slider"></span>
</label>
</div>
</div>
);
}
</file>

</files>
