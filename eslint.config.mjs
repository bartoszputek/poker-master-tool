import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['node_modules', 'dist', 'build', 'public', 'coverage', 'frontend', 'benchmark-results', 'test-results', 'playwright-report'],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  stylistic.configs.customize({ indent: 2, quotes: 'single', semi: true, braceStyle: '1tbs', arrowParens: true }),
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // Keep the airbnb-era formatting that the code base already uses.
      '@stylistic/max-len': ['error', { code: 135 }],
      '@stylistic/object-curly-newline': ['error', { ObjectPattern: 'never' }],
      '@stylistic/member-delimiter-style': 'off',
      '@stylistic/type-annotation-spacing': 'off',
      '@stylistic/operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
      '@stylistic/indent': ['error', 2, { SwitchCase: 1, assignmentOperator: 'off' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-restricted-syntax': ['error', "BinaryExpression[operator='in']"],
      'no-param-reassign': ['error', { props: false }],
      'no-console': 'warn',
    },
  },
);
