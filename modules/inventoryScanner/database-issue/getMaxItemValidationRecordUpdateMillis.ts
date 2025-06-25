import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'

export default function getMaxItemValidationRecordUpdateMillis(
  itemNumberPrefix = ''
): number {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select max(recordUpdate_timeMillis)
        from ItemValidationRecords
        where recordDelete_timeMillis is null
          and itemNumberPrefix = ?`
    )
    .pluck()
    .get(itemNumberPrefix) as number | undefined

  database.close()

  return result ?? 0
}
