import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import globals from 'globals'

const typescriptFiles = ['frontend/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}', 'server/**/*.ts']

const isOff = (setting) => setting === 'off' || setting === 0 || (Array.isArray(setting) && isOff(setting[0]))

const warnings = (rules) =>
  Object.fromEntries(
    Object.entries(rules)
      .filter(([, setting]) => !isOff(setting))
      .map(([name, setting]) => [name, Array.isArray(setting) ? ['warn', ...setting.slice(1)] : 'warn'])
  )

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/generated/**',
      '**/*.d.ts',
      'graphify-out/**',
      'docs/**',
      'tests/**',
      '.*/**'
    ]
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      globals: globals.node
    },
    rules: {
      ...warnings(js.configs.recommended.rules),
      'no-debugger': 'error'
    }
  },
  {
    files: ['scripts/demo/motion.mjs', 'scripts/demo/walk.mjs', 'scripts/demo/slides/render.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    }
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: typescriptFiles
  })),
  {
    files: typescriptFiles,
    rules: {
      ...warnings(Object.assign({}, ...tseslint.configs.recommended.map((config) => config.rules || {}))),
      'no-debugger': 'error',
      '@typescript-eslint/no-explicit-any': 'error'
    }
  },
  {
    files: ['frontend/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
    rules: {
      ...warnings(reactHooks.configs.flat.recommended.rules),
      'react-hooks/rules-of-hooks': 'error'
    }
  },
  prettier
]
