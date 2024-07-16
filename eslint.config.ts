import { configWebApp } from 'eslint-config-cityssm'
import tseslint from 'typescript-eslint'

export const config = tseslint.config(...configWebApp, {
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.json', './tsconfig.client.json']
    }
  },
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off'
  }
})

export default config
