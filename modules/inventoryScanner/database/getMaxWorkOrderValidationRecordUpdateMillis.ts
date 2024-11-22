import sqlite from 'better-sqlite3'

import { databasePath } from './helpers.database.js'

export default function getMaxWorkOrderValidationRecordUpdateMillis(): number {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select max(recordUpdate_timeMillis)
        from WorkOrderValidationRecords
        where recordDelete_timeMillis is null`
    )
    .pluck()
    .get() as number | undefined

  database.close()

  return result ?? 0
}
