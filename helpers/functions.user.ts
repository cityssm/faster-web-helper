import { randomUUID } from 'node:crypto'

import {
  ADWebAuthAuthenticator,
  ActiveDirectoryAuthenticator,
  type BaseAuthenticator
} from '@cityssm/authentication-helper'

import { getConfigProperty } from './functions.config.js'

// eslint-disable-next-line @typescript-eslint/init-declarations
let authenticator: BaseAuthenticator | undefined

const authenticationConfig = getConfigProperty(
  'login.authentication'
)

const domain = getConfigProperty('login.domain')

switch (authenticationConfig?.type) {
  case 'activeDirectory': {
    authenticator = new ActiveDirectoryAuthenticator(
      authenticationConfig.config
    )
    break
  }
  case 'adWebAuth': {
    authenticator = new ADWebAuthAuthenticator(authenticationConfig.config)
    break
  }
}

export async function authenticate(
  userName: string,
  password: string
): Promise<boolean> {
  if (authenticator === undefined) {
    return false
  }

  return await authenticator.authenticate(`${domain}\\${userName}`, password)
}

export function generateKeyGuid(): string {
  return randomUUID().replaceAll('-', '')
}