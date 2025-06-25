import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'

export default function closeInventoryBatch(
  batchId: number | string,
  user: FasterWebHelperSessionUser
): boolean {
  const database = sqlite(databasePath)

  const rightNow = new Date()

  const result = database
    .prepare(
      `update InventoryBatches
        set closeDate = ?,
          closeTime = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where batchId = ?
          and closeDate is null
          and recordDelete_timeMillis is null`
    )
    .run(
      dateToInteger(rightNow),
      dateToTimeInteger(rightNow),
      user.userName,
      rightNow.getTime(),
      batchId
    )

  database.close()

  return result.changes > 0
}
