import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Flat config (ESLint 9). Replaces the legacy CRA `react-app` shareable config,
// which is not installed and is incompatible with ESLint 9. Scoped to TS/TSX so
// generated/config/JSON files are left alone.
export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.amplify/**',
      'amplify_outputs.json',
      'node-polyfill.js',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      // NOTE: eslint-plugin-react-hooks v7's "recommended" preset bundles the
      // opinionated React Compiler rules (use-memo, immutability,
      // set-state-in-effect) plus a rules-of-hooks check that misfires on this
      // codebase's lowercase-named components. The project never adopted those,
      // so the preset is intentionally not spread here. The plugins stay
      // registered so the rules can be opted into per-file/in future.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
];
