module.exports = {
  root: true,
  extends: ['expo'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
  },
};
