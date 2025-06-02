import { adminUserSettingNames } from '../modules/admin/helpers/userSettings.helpers.js'
import { integrityCheckerUserSettingNames } from '../modules/integrityChecker/helpers/userSettings.helpers.js'
import { inventoryScannerUserSettingNames } from '../modules/inventoryScanner/helpers/userSettings.helpers.js'

export const userSettingNames = [
  ...adminUserSettingNames,
  ...integrityCheckerUserSettingNames,
  ...inventoryScannerUserSettingNames
] as const
