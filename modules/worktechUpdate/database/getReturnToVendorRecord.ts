import sqlite from 'better-sqlite3'

import type { ReturnToVendorRecord } from '../worktechUpdateTypes.js'

import { databasePath } from './databaseHelpers.js'

interface GetReturnToVendorRecord extends Partial<ReturnToVendorRecord> {
  storeroom: string
  itemNumber: string
  transactionDate: number
  quantity: number
  cost: number
}

export default function getReturnToVendorRecord(
  returnToVendorRecord: GetReturnToVendorRecord
): ReturnToVendorRecord | undefined {
  const database = sqlite(databasePath)

  let sql = `select documentNumber, storeroom, itemNumber, transactionDate, quantity, cost
        from ReturnToVendorRecords
        where storeroom = ?
        and itemNumber = ?
        and transactionDate = ?
        and quantity = ?
        and cost = ?`

  const sqlParameters = [
    returnToVendorRecord.storeroom,
    returnToVendorRecord.itemNumber,
    returnToVendorRecord.transactionDate,
    returnToVendorRecord.quantity,
    returnToVendorRecord.cost
  ]

  if (returnToVendorRecord.documentNumber !== undefined) {
    sql += ' and documentNumber = ?'
    sqlParameters.push(returnToVendorRecord.documentNumber)
  }

  const row = database.prepare(sql).get(...sqlParameters) as
    | ReturnToVendorRecord
    | undefined

  database.close()

  return row
}
