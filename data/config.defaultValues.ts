import type {
  ADWebAuthAuthenticatorConfiguration,
  ActiveDirectoryAuthenticatorConfiguration
} from '@cityssm/authentication-helper'
import { hoursToMillis } from '@cityssm/to-millis'
import type { AccessOptions } from 'basic-ftp'
import type { config as MSSQLConfig } from 'mssql'
import type { Spec } from 'node-schedule'

import type {
  ConfigItemValidationDynamicsGP,
  ConfigItemValidationFaster,
  ConfigWorkOrderValidationFasterApi
} from '../modules/inventoryScanner/configTypes.js'
import type {
  ConfigFileSuffixXlsx,
  ConfigScheduledFtpReport
} from '../types/configHelperTypes.js'
import type { ConfigFasterWeb } from '../types/configTypes.js'

export const configDefaultValues = {
  ftp: undefined as unknown as AccessOptions | undefined,

  'webServer.httpPort': 8080,
  'webServer.urlPrefix': '',

  'webServer.session.cookieName': 'faster-web-helper-user-sid',
  'webServer.session.secret': 'cityssm/faster-web-helper',
  'webServer.session.maxAgeMillis': hoursToMillis(12),

  'login.domain': '',
  'login.authentication': undefined as
    | {
        type: 'activeDirectory'
        config: ActiveDirectoryAuthenticatorConfiguration
      }
    | {
        type: 'adWebAuth'
        config: ADWebAuthAuthenticatorConfiguration
      }
    | undefined,

  fasterWeb: { tenantOrBaseUrl: '' } as unknown as ConfigFasterWeb,

  worktech: undefined as unknown as MSSQLConfig | undefined,
  dynamicsGP: undefined as unknown as MSSQLConfig | undefined,

  /*
   * Autocomplete
   */

  'modules.autocomplete.isEnabled': false,
  'modules.autocomplete.runOnStartup': true,

  'modules.autocomplete.reports.w114': undefined as unknown as
    | ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
    | undefined,

  'modules.autocomplete.reports.w200': undefined as unknown as
    | ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
    | undefined,

  /*
   * Inventory Scanner
   */

  'modules.inventoryScanner.isEnabled': false,
  'modules.inventoryScanner.runOnStartup': true,

  'modules.inventoryScanner.scannerIpAddressRegex': /^$/,

  'modules.inventoryScanner.workOrders.acceptNotValidated': true,
  'modules.inventoryScanner.workOrders.fasterRegex': /^\d+$/,

  // eslint-disable-next-line no-secrets/no-secrets
  'modules.inventoryScanner.workOrders.acceptWorkTech': false,

  // eslint-disable-next-line no-secrets/no-secrets
  'modules.inventoryScanner.workOrders.workTechRegex': /^[A-Z]{2}.\d{2}.\d{5}$/,

  'modules.inventoryScanner.workOrders.validationSources': [] as Array<
    'fasterApi' | 'worktech'
  >,

  'modules.inventoryScanner.items.acceptNotValidated': true,
  'modules.inventoryScanner.items.itemNumberRegex': undefined as unknown as
    | RegExp
    | undefined,
  'modules.inventoryScanner.items.validation': undefined as unknown as
    | ConfigItemValidationDynamicsGP
    | ConfigItemValidationFaster
    | undefined,

  'modules.inventoryScanner.quantities.acceptOverages': true,
  'modules.inventoryScanner.quantities.acceptNegatives': true,

  'modules.inventoryScanner.reports.w311': undefined as unknown as
    | ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
    | undefined,

  'modules.inventoryScanner.reports.w604': undefined as unknown as
    | ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
    | undefined,

  /*
   * Worktech Update
   */

  'modules.worktechUpdate.isEnabled': false,
  'modules.worktechUpdate.runOnStartup': true,

  'modules.worktechUpdate.resourceItem.itemClass': 'FASTER',
  'modules.worktechUpdate.resourceItem.itemType': 'FASTER',
  'modules.worktechUpdate.resourceItem.unit': 'EA',

  'modules.worktechUpdate.reports.w114': undefined as unknown as
    | ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
    | undefined,

  'modules.worktechUpdate.reports.w217': undefined as unknown as
    | ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
    | undefined,

  'modules.worktechUpdate.reports.w223': undefined as unknown as
    | ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
    | undefined,

  /*
   * Temp Folder Cleanup
   */

  'modules.tempFolderCleanup.isEnabled': true,
  'modules.tempFolderCleanup.runOnStartup': false,
  'modules.tempFolderCleanup.schedule': {
    dayOfWeek: 0,
    hour: 1,
    minute: 0,
    second: 0
  } as unknown as Spec,
  'modules.tempFolderCleanup.maxAgeDays': 35
}
