import { dirname } from 'path';
import { fileURLToPath } from 'url';
import nextConfig from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  ...nextConfig,
  ...nextTs,
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
      '.next/**',
      'node_modules/**',
      'dist/**',
      'out/**',
      'build/**',
      '*.config.js',
      '*.config.ts',
      'next-env.d.ts',
    ],
  },
];
