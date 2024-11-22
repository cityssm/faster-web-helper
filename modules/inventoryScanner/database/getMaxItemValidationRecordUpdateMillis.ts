import sqlite from 'better-sqlite3'

import { databasePath } from './helpers.database.js'

export default function getMaxItemValidationRecordUpdateMillis(): number {
  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `select max(recordUpdate_timeMillis)
        from ItemValidationRecords
        where recordDelete_timeMillis is null`
    )
    .pluck()
    .get() as number | undefined

  database.close()

  return result ?? 0
}