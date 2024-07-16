import sqlite from 'better-sqlite3'

import type { ReturnToVendorRecord } from '../../worktechUpdateTypes.js'

import { databasePath } from './databaseHelpers.js'

export default function getReturnToVendorRecord(
  returnToVendorRecord: ReturnToVendorRecord
): ReturnToVendorRecord | undefined {
  const database = sqlite(databasePath)

  const row = database
    .prepare(
      `select documentNumber, storeroom, itemNumber, transactionDate, quantity, cost
        from ReturnToVendorRecords
        where documentNumber = ?
        and storeroom = ?
        and itemNumber = ?
        and transactionDate = ?
        and quantity = ?
        and cost = ?`
    )
    .get(
      returnToVendorRecord.documentNumber,
      returnToVendorRecord.storeroom,
      returnToVendorRecord.itemNumber,
      returnToVendorRecord.transactionDate,
      returnToVendorRecord.quantity,
      returnToVendorRecord.cost
    ) as ReturnToVendorRecord | undefined

  database.close()

  return row
}
