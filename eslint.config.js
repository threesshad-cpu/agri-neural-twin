import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore dist, generated pptx scripts, and server utils
  globalIgnores(['dist/**', '**/*.cjs', 'server/utils/**']),

  // Server-side Node.js files (CommonJS)
  {
    files: ['server/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.node },
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Frontend source files
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Allow uppercase, underscore-prefixed, AND namespace objects like `motion`
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^([A-Z_]|motion|animate)',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // Allow files that export both components and utility functions/hooks
      'react-refresh/only-export-components': ['warn', {
        allowConstantExport: true,
        allowExportNames: ['useAuth', 'useTranslation', 'LanguageProvider'],
      }],
      // React Compiler set-state-in-effect fires on valid reset patterns like setLoading(true);
      // downgrade to warn — builds should not fail for this pattern
      'react-hooks/set-state-in-effect': 'warn',
      // preserve-manual-memoization fires when React Compiler can't preserve deps; downgrade to warn
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
])
