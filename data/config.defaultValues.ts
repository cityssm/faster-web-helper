// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-magic-numbers */

import type {
  ADWebAuthAuthenticatorConfiguration,
  ActiveDirectoryAuthenticatorConfiguration,
  PlainTextAuthenticatorConfiguration
} from '@cityssm/authentication-helper'
import type { nodeSchedule } from '@cityssm/scheduled-task'
import { hoursToMillis } from '@cityssm/to-millis'
import type { AccessOptions } from 'basic-ftp'
import type { config as MSSQLConfig } from 'mssql'

import integrityCheckerDefaultValues from '../modules/integrityChecker/config/defaultValues.js'
import inventoryScannerDefaultValues from '../modules/inventoryScanner/config/defaultValues.js'
import type {
  ConfigFileSuffixXlsx,
  ConfigScheduledFtpReport
} from '../types/config.helperTypes.js'
import type { ConfigFasterWeb } from '../types/config.types.js'

export const configDefaultValues = {
  'application.workDays': [1, 2, 3, 4, 5],
  'application.workHours': [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],

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
    | {
        type: 'plainText'
        config: PlainTextAuthenticatorConfiguration
      }
    | undefined,

  fasterWeb: { tenantOrBaseUrl: '' } as unknown as ConfigFasterWeb,

  worktech: undefined as unknown as MSSQLConfig | undefined,
  dynamicsGP: undefined as unknown as MSSQLConfig | undefined,

  'ntfy.server': '',

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

  ...inventoryScannerDefaultValues,

  /*
   * Worktech Update
   */

  ...integrityCheckerDefaultValues,

  /*
   * Temp Folder Cleanup
   */

  'modules.tempFolderCleanup.isEnabled': true,
  'modules.tempFolderCleanup.schedule': {
    dayOfWeek: 0,
    hour: 1,
    minute: 0,
    second: 0
  } as unknown as nodeSchedule.Spec,
  'modules.tempFolderCleanup.maxAgeDays': 35
}
