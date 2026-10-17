import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const FRONTEND_FILES = ['apps/frontend/**/*.{js,ts,svelte}'];

// The svelte presets apply some rules to all files. Limit them to the frontend.
const forFrontend = (configs) =>
  configs.map((config) => ({ ...config, files: config.files ?? FRONTEND_FILES }));

export default defineConfig(
  {
    ignores: [
      '**/node_modules',
      '**/dist',
      '**/build',
      '**/coverage',
      '**/.svelte-kit',
      '**/test-results',
      '**/playwright-report',
      'packages/addon/data',
    ],
  },
  js.configs.recommended,
  ts.configs.recommended,
  forFrontend(svelte.configs.recommended),
  // Prettier formats the code, so turn off the ESLint rules that conflict with it.
  prettier,
  forFrontend(svelte.configs.prettier),
  {
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      // verbatimModuleSyntax keeps every value import, so type-only imports must say "type".
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      // An import with only inline types still loads the module. Use "import type" for it.
      '@typescript-eslint/no-import-type-side-effects': 'error',
      'no-restricted-syntax': ['error', "BinaryExpression[operator='in']"],
      'no-param-reassign': ['error', { props: false }],
      'no-console': 'warn',
    },
  },
  {
    files: ['**/*.cjs', 'packages/addon/index.js'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['apps/frontend/**'],
    languageOptions: { globals: globals.browser },
    rules: {
      // typescript-eslint recommends that you do not use no-undef on TypeScript projects.
      'no-undef': 'off',
      'no-console': 'off',
      // {' '} keeps the whitespace between inline-block card buttons, which the layout needs.
      'svelte/no-useless-mustaches': 'off',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
      },
    },
  },
);
