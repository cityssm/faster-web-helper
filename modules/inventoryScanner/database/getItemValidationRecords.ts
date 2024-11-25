import sqlite from 'better-sqlite3'

import type { ItemValidationRecord } from '../types.js'

import { databasePath } from './helpers.database.js'

export default function getItemValidationRecords(): ItemValidationRecord[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select itemStoreroom, itemNumber,
        itemDescription, availableQuantity, unitPrice
        from ItemValidationRecords
        where recordDelete_timeMillis is null
        order by itemStoreroom, itemNumber`
    )
    .all() as ItemValidationRecord[]

  database.close()

  return result
}

export function getItemValidationRecordsByItemNumber(
  itemNumber: string,
  connectedDatabase?: sqlite.Database
): ItemValidationRecord[] {
  const database =
    connectedDatabase ??
    sqlite(databasePath, {
      readonly: true
    })

  const result = database
    .prepare(
      `select itemStoreroom, itemNumber,
        itemDescription, availableQuantity, unitPrice
        from ItemValidationRecords
        where recordDelete_timeMillis is null
        and itemNumber = ?
        order by itemStoreroom`
    )
    .all(itemNumber) as ItemValidationRecord[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}
