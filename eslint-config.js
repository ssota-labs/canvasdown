import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * Shared ESLint configuration for all packages
 * Each package should import this and add tsconfigRootDir
 */
export const sharedConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // JavaScript files don't need type checking
  {
    files: ['*.js', '*.jsx'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.eslintrc.js',
      '*.config.js',
      '*.config.ts',
    ],
  },
];
