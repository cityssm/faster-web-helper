import eslintConstants from '@cityssm/faster-constants/other/eslint'
import { configWebApp, cspellWords, tseslint } from 'eslint-config-cityssm'

export const config = tseslint.config(...configWebApp, {
  rules: {
    '@cspell/spellchecker': [
      'warn',
      {
        cspell: {
          words: [
            ...cspellWords,
            ...eslintConstants.cspellWords,
            'autoincrement',
            'fieldsets',
            'fontawesome',
            'nhtsa',
            'ntfy',
            'resave',
            'unvalidated',
            'worktech'
          ]
        }
      }
    ],
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-type-assertion': 'off'
  }
})

export default config
