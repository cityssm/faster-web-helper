import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'

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

  database
    .prepare(
      `update InventoryScannerRecords
        set secondaryRecordSync_userName = ?,
          secondaryRecordSync_timeMillis = ?
        where recordDelete_timeMillis is null
          and secondaryRecordSync_timeMillis is null
          and secondaryWorkOrderType is not null
          and secondaryWorkOrderNumber is not null`
    )
    .run(updateUser.userName, Date.now())

  database.close()

  return result.changes
}
