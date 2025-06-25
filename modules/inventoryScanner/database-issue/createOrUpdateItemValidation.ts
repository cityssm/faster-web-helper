import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'
import type { ItemValidationRecord } from '../types.js'

import getItemValidation from './getItemValidation.js'

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
          itemStoreroom, itemNumberPrefix, itemNumber, itemDescription, availableQuantity, unitPrice,
          rawJsonData,
          recordCreate_timeMillis, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        validationRecord.itemStoreroom,
        validationRecord.itemNumberPrefix,
        validationRecord.itemNumber,
        validationRecord.itemDescription,
        validationRecord.availableQuantity,
        validationRecord.unitPrice,
        validationRecord.rawJsonData ?? {},
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
            rawJsonData = ?,
            recordUpdate_timeMillis = ?,
            recordDelete_timeMillis = null
          where itemStoreroom = ?
            and itemNumberPrefix = ?
            and itemNumber = ?`
      )
      .run(
        validationRecord.itemDescription,
        validationRecord.availableQuantity,
        validationRecord.unitPrice,
        validationRecord.rawJsonData ?? {},
        timeMillis,
        validationRecord.itemStoreroom,
        validationRecord.itemNumberPrefix,
        validationRecord.itemNumber
      )
  }

  database.close()
}
