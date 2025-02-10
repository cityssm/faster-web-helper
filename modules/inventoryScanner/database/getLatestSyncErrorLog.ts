import {
  dateIntegerToString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import type { InventoryScannerSyncErrorLogRecord, WorkOrderType } from '../types.js'

import { databasePath } from './helpers.database.js'

export default function getLatestSyncErrorLog(
  workOrderType: WorkOrderType,
  connectedDatabase?: sqlite.Database
): InventoryScannerSyncErrorLogRecord | undefined {
  const database = connectedDatabase ?? sqlite(databasePath)

  const row = database
    .function('userFunction_dateIntegerToString', dateIntegerToString)
    .function('userFunction_timeIntegerToString', timeIntegerToString)
    .prepare(
      `select recordId, workOrderType,
        logId,
        logDate, userFunction_dateIntegerToString(logDate) as logDateString,
        logTime, userFunction_timeIntegerToString(logTime) as logTimeString,
        logMessage,
        scannerSyncedRecordId, scannerRecordId
        from InventoryScannerSyncErrorLog
        where workOrderType = ?
        and recordDelete_timeMillis is null
        order by logDate desc, logTime desc
        limit 1`
    )
    .get(workOrderType) as InventoryScannerSyncErrorLogRecord | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return row
}
