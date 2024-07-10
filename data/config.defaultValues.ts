import type { AccessOptions } from 'basic-ftp'

import type { ConfigFtpPath } from '../types/configTypes.js'

export const configDefaultValues = {
  ftp: undefined as unknown as AccessOptions,

  'modules.inventoryScanner.isEnabled': false,

  'modules.inventoryScanner.reports.w200':
    undefined as unknown as ConfigFtpPath,

  'modules.inventoryScanner.reports.w311':
    undefined as unknown as ConfigFtpPath,

  'modules.inventoryScanner.reports.w604': undefined as unknown as ConfigFtpPath
}
