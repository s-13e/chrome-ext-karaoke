const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const pluginReact = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  js.configs.recommended,
  ...compat.extends('plugin:import/recommended'),
  ...compat.extends('plugin:react/recommended'),

  // 전역 변수 & 공통 규칙
  {
    name: 'chrome-extension/base',
    files: ['**/*.{js,ts,jsx,tsx}'],
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prefer-const': 'error',
      'import/no-default-export': 'error',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        chrome: 'readonly',
        YT: 'readonly',
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
      '@typescript-eslint/no-unused-vars': [
        'error',
        { vars: 'all', args: 'after-used', ignoreRestSiblings: true, argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        // 1. UPPER_CASE const 상수 (최우선 적용)
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['UPPER_CASE'],
          filter: {
            regex: '^[A-Z_]+$', // 대문자+언더스코어만 허용
            match: true,
          },
        },
        // 2. camelCase const 변수
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase'],
          filter: {
            regex: '^[a-z]', // 소문자 시작만 허용
            match: true,
          },
        },
        // 1. React 컴포넌트 (exported 함수 타입 변수 + JSX 사용)
        {
          selector: ['variable', 'function'],
          modifiers: ['exported'],
          types: ['function'],
          format: ['PascalCase'],
          filter: {
            // JSX 컴포넌트로 사용되는 변수만 대상 (예: <MyComponent />)
            regex: '^[A-Z]',
            match: true,
          },
        },
        // 2. 일반 함수 (camelCase)
        {
          selector: 'function',
          modifiers: ['exported'],
          format: ['camelCase'],
          filter: {
            regex: '^[A-Z]',
            match: false,
          },
        },
        {
          selector: 'variable',
          format: ['PascalCase'],
          filter: {
            regex: '^[A-Z]', // 대문자 시작
            match: true,
          },
        },
        // 3. 변수 (camelCase)
        {
          selector: 'variable',
          format: ['camelCase'],
          filter: {
            regex: '^[A-Z]',
            match: true,
          },
        },
        // 5. 타입 정의 규칙
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
    },
  },
  // constants 폴더 전용 규칙 (UPPER_CASE 강제)
  {
    name: 'chrome-extension/constants-upper-case',
    files: ['src/constants/**/*.ts'],
    plugins: { '@typescript-eslint': tseslint },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['UPPER_CASE'], // constants 폴더 내 모든 const는 UPPER_CASE
        },
      ],
    },
  },
  // types 폴더 규칙 (지역 변수는 camelCase 허용)
  {
    name: 'chrome-extension/types-flexible',
    files: ['src/lib/types/**/*.ts'],
    plugins: { '@typescript-eslint': tseslint },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        // 모듈 레벨 const는 UPPER_CASE
        {
          selector: 'variable',
          modifiers: ['const', 'exported'],
          format: ['UPPER_CASE'],
        },
        // 함수 내부 지역 const는 camelCase 허용
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'UPPER_CASE'],
        },
        // 타입 정의는 PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
    },
  },
  {
    name: 'chrome-extension/type-declarations',
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      'import/no-default-export': 'off',
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
      'react/prop-types': 'off',
    },
  },
  {
    name: 'react-bits-ignore-any',
    files: ['src/components/react-bits/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
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
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
  prettierConfig,
];
