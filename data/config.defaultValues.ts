import type { AccessOptions } from 'basic-ftp'
import type { config as MSSQLConfig } from 'mssql'

import type {
  ConfigFileSuffixXlsx,
  ConfigScheduledFtpReport
} from '../types/configTypes.js'

export const configDefaultValues = {
  ftp: undefined as unknown as AccessOptions,

  worktech: undefined as unknown as MSSQLConfig,

  /*
   * Inventory Scanner
   */

  'modules.inventoryScanner.isEnabled': false,

  'modules.inventoryScanner.reports.w200':
    undefined as unknown as ConfigScheduledFtpReport<ConfigFileSuffixXlsx>,

  'modules.inventoryScanner.reports.w311':
    undefined as unknown as ConfigScheduledFtpReport<ConfigFileSuffixXlsx>,

  'modules.inventoryScanner.reports.w604':
    undefined as unknown as ConfigScheduledFtpReport<ConfigFileSuffixXlsx>,

  /*
   * Worktech Update
   */

  'modules.worktechUpdate.isEnabled': false,
  'modules.worktechUpdate.runOnStartup': true,

  'modules.worktechUpdate.resourceItem.itemClass': 'FASTER',
  'modules.worktechUpdate.resourceItem.itemType': 'FASTER',
  'modules.worktechUpdate.resourceItem.unit': 'EA',

  'modules.worktechUpdate.reports.w217':
    undefined as unknown as ConfigScheduledFtpReport<ConfigFileSuffixXlsx>,

  'modules.worktechUpdate.reports.w223':
    undefined as unknown as ConfigScheduledFtpReport<ConfigFileSuffixXlsx>
}
