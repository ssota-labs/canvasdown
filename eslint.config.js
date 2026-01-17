import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { sharedConfig } from './eslint-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  ...sharedConfig,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/*.config.js',
      '**/*.config.ts',
      '**/eslint-config.js',
    ],
  },
];
