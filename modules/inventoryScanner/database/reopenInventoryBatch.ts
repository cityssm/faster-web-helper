import sqlite from 'better-sqlite3'

import { databasePath } from './helpers.database.js'

export default function reopenInventoryBatch(
  batchId: number | string,
  user: FasterWebHelperSessionUser
): boolean {
  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `update InventoryBatches
        set closeDate = null,
          closeTime = null,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where batchId = ?
          and closeDate is not null
          and recordSync_timeMillis is null
          and recordDelete_timeMillis is null`
    )
    .run(
      user.userName,
      Date.now(),
      batchId
    )

  database.close()

  return result.changes > 0
}
