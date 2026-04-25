import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['.next/', 'node_modules/', 'dist/', 'legacy/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...next,
  prettier,
  {
    rules: {
      // Allow underscore-prefixed unused vars (common pattern for ignored params)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // React Compiler rules — downgrade to warnings for existing code patterns
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
];
