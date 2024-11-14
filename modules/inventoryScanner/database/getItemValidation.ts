import sqlite from 'better-sqlite3'

import type { ItemValidationRecord } from '../types.js'

import { databasePath } from './helpers.database.js'

export default function getItemValidation(
  itemStoreroom: string,
  itemNumber: string,
  includeDeleted: boolean,
  connectedDatabase?: sqlite.Database
): ItemValidationRecord | undefined {
  const database = connectedDatabase ?? sqlite(databasePath)

  const result = database
    .prepare(
      `select itemStoreroom, itemNumber,
        itemDescription, availableQuantity, unitPrice
        from ItemValidationRecords
        where itemStoreroom = ?
        and itemNumber = ?
        ${includeDeleted ? '' : ' and recordDelete_timeMillis is not null'}`
    )
    .get(itemStoreroom, itemNumber) as ItemValidationRecord | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}
