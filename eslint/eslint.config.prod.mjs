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
