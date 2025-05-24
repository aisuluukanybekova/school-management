// frontend/.eslintrc.cjs
module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'jsx-a11y'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'no-param-reassign': 'off',
    'no-unused-expressions': 'warn',
    'max-len': ['warn', { code: 120 }],
    'no-unused-vars': 'warn',
    'react/no-array-index-key': 'warn',
    'react/prop-types': 'warn',
  },
};
