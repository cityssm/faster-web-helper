import sqlite from 'better-sqlite3'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../../debug.config.js'
import { type SettingName, databasePath } from '../helpers/database.helpers.js'
import { moduleName } from '../helpers/module.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:${moduleName}:updateSetting`)

const maxRetries = 3

export default function updateSetting(
  settingName: SettingName,
  settingValue: string,
  retriesRemaining: number = maxRetries
): boolean {
  if (retriesRemaining <= 0) {
    debug(
      `Failed to update setting "${settingName}" with value "${settingValue}" after multiple attempts.`
    )

    return false
  }

  let database: sqlite.Database | undefined = undefined

  try {
    database = sqlite(databasePath)

    const result = database
      .prepare(
        `update InventoryScannerSettings
          set previousSettingValue = settingValue,
          settingValue = ?,
          recordUpdate_timeMillis = ?
          where settingName = ?`
      )
      .run(settingValue, Date.now(), settingName)

    if (result.changes <= 0) {
      database
        .prepare(
          `insert into InventoryScannerSettings
            (settingName, previousSettingValue, settingValue, recordUpdate_timeMillis)
            values (?, null, ?, ?)`
        )
        .run(settingName, settingValue, Date.now())
    }

    return true
  } catch (error) {
    debug(
      `Error updating setting "${settingName}" with value "${settingValue}": ${error}`
    )

    return updateSetting(settingName, settingValue, retriesRemaining - 1)
  } finally {
    database?.close()
  }
}
