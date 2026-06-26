import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.next', 'out']),
  {
    files: ['app/api/**/*.js', 'app/lib/**/*.js', 'next.config.js', 'postcss.config.mjs'],
    extends: [
      js.configs.recommended,
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        fetch: 'readonly',
        FormData: 'readonly',
      },
    },
  },
  {
    files: ['app/**/*.{js,jsx}'],
    ignores: ['app/api/**/*.js', 'app/lib/**/*.js'],
    extends: [
      js.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
