import { randomUUID } from 'node:crypto'

import {
  type BaseAuthenticator,
  ActiveDirectoryAuthenticator,
  ADWebAuthAuthenticator,
  PlainTextAuthenticator
} from '@cityssm/authentication-helper'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../debug.config.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:users.functions`)

let authenticator: BaseAuthenticator | undefined

const authenticationConfig = getConfigProperty('login.authentication')

const domain = getConfigProperty('login.domain')

if (authenticationConfig === undefined) {
  debug('`login.authentication` not defined.')
} else {
  switch (authenticationConfig.type) {
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
    case 'plainText': {
      debug('WARNING: Using plain text authentication.')
      authenticator = new PlainTextAuthenticator(authenticationConfig.config)
      break
    }
    // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
    default: {
      debug('Unknown `login.authentication`.')
    }
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
