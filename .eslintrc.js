module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:sonarjs/recommended',
    'plugin:security/recommended',
    'google',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  // parserOptions: {
  //   project: ["tsconfig.json"],
  //   sourceType: "module",
  // },
  ignorePatterns: [
    '/lib/**/*', // Ignore built files.
  ],
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
    'quotes': ['error', 'single'],
    'object-curly-spacing': [1, 'always'],
    'import/no-unresolved': 0,
    'import/prefer-default-export': 'off',
    'indent': ['error', 2],
    'new-cap': 0,
    'require-jsdoc': 0,
    'max-len': [0, { 'code': 120 }],
    'no-case-declarations': 0,
    'linebreak-style': 0,
    'react/jsx-props-no-spreading': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};

