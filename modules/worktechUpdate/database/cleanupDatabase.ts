import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { databasePath } from './databaseHelpers.js'

const returnToVendorRecordsMaxAgeDays = 365
const workOrderNumberMappingsMaxAgeDays = 365 * 2

function getPastDateInteger(pastDays: number): number {
  const date = new Date()
  date.setDate(date.getDate() - pastDays)
  return dateToInteger(date)
}

export default function cleanupDatabase(): {
  returnToVendorRecords: number
  workOrderNumberMappings: number
} {
  const database = sqlite(databasePath)

  const returnToVendorRecords = database
    .prepare(
      `delete from ReturnToVendorRecords
        where transactionDate < ?`
    )
    .run(getPastDateInteger(returnToVendorRecordsMaxAgeDays)).changes

  const workOrderNumberMappings = database
    .prepare(
      `delete from WorkOrderNumberMappings
        where exportDate < ?`
    )
    .run(getPastDateInteger(workOrderNumberMappingsMaxAgeDays)).changes

  database.close()

  return {
    returnToVendorRecords,
    workOrderNumberMappings
  }
}
