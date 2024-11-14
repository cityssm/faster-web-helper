import sqlite from 'better-sqlite3'

import type { ItemValidationRecord } from '../types.js'

import getItemValidation from './getItemValidation.js'
import { databasePath } from './helpers.database.js'

export default function createOrUpdateItemValidation(
  validationRecord: ItemValidationRecord,
  timeMillis: number
): void {
  const database = sqlite(databasePath)

  const databaseRecord = getItemValidation(
    validationRecord.itemStoreroom,
    validationRecord.itemNumber,
    true,
    database
  )

  if (databaseRecord === undefined) {
    database
      .prepare(
        `insert into ItemValidationRecords (
          itemStoreroom, itemNumber, itemDescription, availableQuantity, unitPrice,
          recordCreate_timeMillis, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        validationRecord.itemStoreroom,
        validationRecord.itemNumber,
        validationRecord.itemDescription,
        validationRecord.availableQuantity,
        validationRecord.unitPrice,
        timeMillis,
        timeMillis
      )
  } else {
    database
      .prepare(
        `update ItemValidationRecords
          set itemDescription = ?,
          availableQuantity = ?,
          unitPrice = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_timeMillis = null
          where itemStoreroom = ?
          and itemNumber = ?`
      )
      .run(
        validationRecord.itemDescription,
        validationRecord.availableQuantity,
        validationRecord.unitPrice,
        timeMillis,
        validationRecord.itemStoreroom,
        validationRecord.itemNumber
      )
  }

  database.close()
}
