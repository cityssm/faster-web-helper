import sqlite from 'better-sqlite3'

import { type SettingName, databasePath } from './helpers.database.js'

export default function deleteSetting(settingName: SettingName): boolean {
  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `delete from InventoryScannerSettings
        where settingName = ?`
    )
    .run(settingName)

  database.close()

  return result.changes > 0
}
