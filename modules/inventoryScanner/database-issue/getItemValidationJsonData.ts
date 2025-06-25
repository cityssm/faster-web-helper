import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'

export default function getItemValidationJsonData(
  itemStoreroom: string,
  itemNumber: string
): object | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select rawJsonData
        from ItemValidationRecords
        where itemStoreroom = ?
          and itemNumber = ?
          and recordDelete_timeMillis is null`
    )
    .pluck()
    .get(itemStoreroom, itemNumber) as string | undefined

  database.close()

  return typeof result === 'string' ? (JSON.parse(result) as object) : undefined
}
