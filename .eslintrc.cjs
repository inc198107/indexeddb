module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        js: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      { functions: false, classes: true, variables: true, typedefs: true },
    ],
    'max-classes-per-file': ['error', { max: 1, ignoreExpressions: true }],
  },
  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        'max-classes-per-file': 'off',
      },
    },
    {
      files: ['tests/**/*.ts'],
      rules: {
        'max-classes-per-file': 'off',
        'no-underscore-dangle': 'off',
        'class-methods-use-this': 'off',
        '@typescript-eslint/no-dupe-class-members': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
