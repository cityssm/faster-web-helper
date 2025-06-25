import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'

export function markSyncErrorScannerRecordForPending(
  recordId: number | string,
  updateUser: FasterWebHelperSessionUser
): boolean {
  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `update InventoryScannerRecords
        set recordSync_userName = null,
          recordSync_timeMillis = null,
          recordSync_message = null,
          recordSync_isSuccessful = null,
          recordSync_syncedRecordId = null,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordId = ?
          and recordDelete_timeMillis is null
          and recordSync_timeMillis is not null
          and recordSync_isSuccessful = 0`
    )
    .run(updateUser.userName, Date.now(), recordId)

  database.close()

  return result.changes > 0
}
