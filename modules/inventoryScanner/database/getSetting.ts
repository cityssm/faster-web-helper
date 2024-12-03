import sqlite from 'better-sqlite3'

import { type SettingName, databasePath } from './helpers.database.js'

export default function getSetting(
  settingName: SettingName
): string | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const settingValue = database
    .prepare(
      `select settingValue
        from InventoryScannerSettings
        where settingName = ?`
    )
    .pluck()
    .get(settingName) as string | undefined

  database.close()

  return settingValue
}
