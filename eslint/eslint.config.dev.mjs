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
