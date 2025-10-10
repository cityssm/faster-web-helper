import eslintConstants from '@cityssm/faster-constants/other/eslint'
import configWebApp, { type ConfigObject, defineConfig } from 'eslint-config-cityssm'
import { cspellWords } from 'eslint-config-cityssm/exports'

export const config: ConfigObject[] = defineConfig(configWebApp, {
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
