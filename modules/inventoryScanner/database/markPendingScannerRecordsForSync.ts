import sqlite from 'better-sqlite3'

import { databasePath } from './helpers.database.js'

export function markPendingScannerRecordsForSync(
  updateUser: FasterWebHelperSessionUser
): number {
  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `update InventoryScannerRecords
        set recordSync_userName = ?,
        recordSync_timeMillis = ?
        where recordDelete_timeMillis is null
        and recordSync_timeMillis is null`
    )
    .run(updateUser.userName, Date.now())

  database.close()

  return result.changes
}
