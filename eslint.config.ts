import { configWebApp, cspellWords, tseslint } from 'eslint-config-cityssm'

export const config = tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        project: true
      }
    }
  },
  ...configWebApp,
  {
    rules: {
      '@cspell/spellchecker': [
        'warn',
        {
          cspell: {
            words: [...cspellWords, 'autoincrement', 'worktech']
          }
        }
      ],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off'
    }
  }
)

export default config
