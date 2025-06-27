import eslintConstants from '@cityssm/faster-constants/other/eslint'
import { configWebApp, cspellWords, tseslint } from 'eslint-config-cityssm'

export const config = tseslint.config(configWebApp, {
  files: ['**/*.ts'],
  rules: {
    '@cspell/spellchecker': [
      'warn',
      {
        cspell: {
          words: [
            ...cspellWords,
            ...eslintConstants.cspellWords,
            'fwhelper',
            'jsbarcode',
            'nhtsa',
            'ntfy',
            'resave',
            'unvalidated',
            'worktech'
          ]
        }
      }
    ],
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-type-assertion': 'off',

    'no-secrets/no-secrets': ['error', { ignoreContent: '^modules.' }]
  }
})

export default config
