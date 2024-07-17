import sqlite from 'better-sqlite3'

import type { ReturnToVendorRecord } from '../worktechUpdateTypes.js'

import { databasePath } from './databaseHelpers.js'

export default function addReturnToVendorRecord(
  returnToVendorRecord: ReturnToVendorRecord
): boolean {
  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `insert into ReturnToVendorRecords 
        (documentNumber, storeroom, itemNumber, transactionDate, quantity, cost)
        values (?, ?, ?, ?, ?, ?)`
    )
    .run(
      returnToVendorRecord.documentNumber,
      returnToVendorRecord.storeroom,
      returnToVendorRecord.itemNumber,
      returnToVendorRecord.transactionDate,
      returnToVendorRecord.quantity,
      returnToVendorRecord.cost
    )

  database.close()

  return result.changes > 0
}
