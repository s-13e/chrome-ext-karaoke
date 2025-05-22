import base from '../eslint.config.mjs';

export default [
  ...base,
  {
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
];
