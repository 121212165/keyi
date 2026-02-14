import parser from '@typescript-eslint/parser'
import plugin from 'typescript-eslint'

export default [
  { ignores: ['dist', 'node_modules', 'vite.config.ts'] },
  ...plugin.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser,
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
]
