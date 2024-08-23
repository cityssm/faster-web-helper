import {
  ADWebAuthAuthenticator,
  ActiveDirectoryAuthenticator,
  type BaseAuthenticator
} from '@cityssm/authentication-helper'

import { getConfigProperty } from '../../../helpers/functions.config.js'

// eslint-disable-next-line @typescript-eslint/init-declarations
let authenticator: BaseAuthenticator | undefined

const authenticationConfig = getConfigProperty(
  'modules.purchaseOrderApprovals.authentication'
)

const domain = getConfigProperty('modules.purchaseOrderApprovals.domain')

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
