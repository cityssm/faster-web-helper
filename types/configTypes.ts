import type {
  ADWebAuthAuthenticatorConfiguration,
  ActiveDirectoryAuthenticatorConfiguration
} from '@cityssm/authentication-helper'
import type { mssqlTypes } from '@cityssm/mssql-multi-pool'
import type { AccessOptions } from 'basic-ftp'
import type { Spec } from 'node-schedule'
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js'

import type { ConfigModuleInventoryScanner } from '../modules/inventoryScanner/configTypes.js'

import type { ConfigFileSuffixXlsx, ConfigScheduledFtpReport } from './configHelperTypes.js'

export interface Config {
  ftp: AccessOptions

  webServer?: {
    httpPort: number
    urlPrefix?: string
    session?: {
      cookieName?: string
      secret?: string
      maxAgeMillis?: number
    }
  }

  login?: {
    domain: string
    authentication:
      | {
          type: 'activeDirectory'
          config: ActiveDirectoryAuthenticatorConfiguration
        }
      | {
          type: 'adWebAuth'
          config: ADWebAuthAuthenticatorConfiguration
        }
  }

  smtp?: SMTPTransport.Options

  fasterWeb?: {
    tenant?: string
  }

  worktech?: mssqlTypes.config

  dynamicsGP?: mssqlTypes.config

  modules: {
    autocomplete?: ConfigModule<ConfigModuleAutocomplete>
    inventoryScanner?: ConfigModule<ConfigModuleInventoryScanner>
    worktechUpdate?: ConfigModule<ConfigModuleWorktechUpdate>
    tempFolderCleanup?: ConfigModule<ConfigModuleTempFolderCleanup>
  }
}

type ConfigModule<T> = {
  runOnStartup?: boolean
} & (
  | ({
      isEnabled: false
    } & Partial<T>)
  | ({
      isEnabled: true
    } & T)
)

interface ConfigModuleAutocomplete {
  reports: {
    /**
     * W114 - Asset Master List
     */
    w114?: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>

    /**
     * W200 - Inventory Report
     */
    w200?: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
  }
}

interface ConfigModuleWorktechUpdate {
  resourceItem?: {
    itemClass?: string
    itemType?: string
    unit?: string
  }

  reports: {
    /**
     * W217 - Direct Charge Transactions
     */
    w217: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>

    /**
     * W223 - Inventory Transaction Details Report
     */
    w223: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
  }
}

interface ConfigModuleTempFolderCleanup {
  schedule?: Spec
  maxAgeDays?: number
}
