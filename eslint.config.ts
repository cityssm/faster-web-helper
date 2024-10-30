import { configWebApp, cspellWords, tseslint } from 'eslint-config-cityssm'

export const config = tseslint.config(...configWebApp, {
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.json', './tsconfig.client.json']
    }
  },
  rules: {
    '@cspell/spellchecker': [
      'warn',
      {
        cspell: {
          words: [...cspellWords, 'worktech']
        }
      }
    ],
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off'
  }
})

export default config
