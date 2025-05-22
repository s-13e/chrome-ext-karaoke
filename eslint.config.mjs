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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
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
        // React 컴포넌트(exported 함수/클래스): PascalCase
        {
          selector: ['function', 'class'], // ★ selector 필수
          modifiers: ['exported'], // export된 것만 대상
          format: ['PascalCase'], // ★ format 필수
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
