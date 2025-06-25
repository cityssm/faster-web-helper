import sqlite from 'better-sqlite3'

import { type SettingName, databasePath } from '../helpers/database.helpers.js'

export default function getSetting(
  settingName: SettingName
): string | null | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const settingValue = database
    .prepare(
      `select settingValue
        from InventoryScannerSettings
        where settingName = ?`
    )
    .pluck()
    .get(settingName) as string | null | undefined

  database.close()

  return settingValue
}

interface SettingValues {
  settingValue: string | null

  previousSettingValue: string | null
}

export function getSettingValues(
  settingName: SettingName
): SettingValues | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const settingValues = database
    .prepare(
      `select previousSettingValue, settingValue
        from InventoryScannerSettings
        where settingName = ?`
    )
    .get(settingName) as SettingValues | undefined

  database.close()

  return settingValues
}
