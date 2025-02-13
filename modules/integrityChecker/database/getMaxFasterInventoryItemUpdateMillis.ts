import sqlite from 'better-sqlite3'

import { databasePath } from './helpers.database.js'

export default function getMaxFasterInventoryItemUpdateMillis(): number {
  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `select max(recordUpdate_timeMillis)
        from FasterInventoryItems`
    )
    .pluck()
    .get() as number | undefined

  database.close()

  return result ?? 0
}
