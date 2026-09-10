import antfu from '@antfu/eslint-config'
import prettier from 'eslint-config-prettier'

export default antfu(
  {
    ignores: ['pnpm-lock.yaml', 'pnpm-workspace.yaml', 'temp/**'],
    markdown: false,
  },
  prettier,
  {
    rules: {
      'no-alert': 'off',
      'no-console': 'off',

      'antfu/consistent-chaining': 'off',
      'antfu/consistent-list-newline': 'off',
      'antfu/if-newline': 'off',

      'jsdoc/require-param-description': 'off',
      'jsdoc/require-property-description': 'off',
      'jsdoc/require-returns-description': 'off',
      'jsdoc/require-template-description': 'off',
      'jsdoc/require-throws-description': 'off',
      'jsdoc/require-yields-description': 'off',

      'jsonc/comma-dangle': 'off',

      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-imports': 'off',

      'unicorn/prefer-dom-node-text-content': 'off',

      'ts/no-redeclare': ['error', { ignoreDeclarationMerge: true }],

      'yaml/plain-scalar': 'off',
    },
  },
)
