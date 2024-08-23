import type {
  ADWebAuthAuthenticatorConfiguration,
  ActiveDirectoryAuthenticatorConfiguration
} from '@cityssm/authentication-helper'
import type { AccessOptions } from 'basic-ftp'
import type { config as MSSQLConfig } from 'mssql'
import type { Spec } from 'node-schedule'

export interface Config {
  ftp: AccessOptions

  webServer?: {
    httpPort: number
    urlPrefix?: string
  }

  worktech?: MSSQLConfig

  modules: {
    autocomplete?: ConfigModule<ConfigModuleAutocomplete>
    inventoryScanner?: ConfigModule<ConfigModuleInventoryScanner>
    worktechUpdate?: ConfigModule<ConfigModuleWorktechUpdate>
    tempFolderCleanup?: ConfigModule<ConfigModuleTempFolderCleanup>
    purchaseOrderApprovals?: ConfigModule<ConfigModulePurchaseOrderApprovals>
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

export interface ConfigFtpPath<S extends string> {
  directory: string
  filePrefix?: string
  fileSuffix?: S
  doDelete?: boolean
}

export interface ConfigScheduledFtpReport<S extends string> {
  ftpPath: ConfigFtpPath<S>
  schedule: Spec
}

export type ConfigFileSuffixXlsx = `${string}.xlsx` | `${string}.XLSX`

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

interface ConfigModuleInventoryScanner {
  reports: {
    /**
     * W200 - Inventory Report
     */
    w200: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>

    /**
     * W311 - Active Work Orders by Shop
     */
    w311: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>

    /**
     * W604 - Integration Log Viewer
     */
    w604: ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
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

interface ConfigModulePurchaseOrderApprovals {
  session?: {
    cookieName?: string
    secret?: string
    maxAgeMillis?: number
  }
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
