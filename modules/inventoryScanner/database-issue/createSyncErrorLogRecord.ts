import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'
import type { WorkOrderType } from '../types.js'

interface CreateSyncErrorLogRecord {
  workOrderType: WorkOrderType

  logId: string

  logDate: Date
  logMessage: string

  scannerSyncedRecordId?: string
  scannerRecordId?: number

  recordCreate_userName: string
}

export default function createSyncErrorLogRecord(
  syncLogError: CreateSyncErrorLogRecord,
  connectedDatabase?: sqlite.Database
): void {
  const database = connectedDatabase ?? sqlite(databasePath)

  database
    .prepare(
      `insert into InventoryScannerSyncErrorLog (
          workOrderType, logId, logDate, logTime, logMessage,
          scannerSyncedRecordId, scannerRecordId,
          recordCreate_userName, recordCreate_timeMillis
        ) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      syncLogError.workOrderType,
      syncLogError.logId,
      dateToInteger(syncLogError.logDate),
      dateToTimeInteger(syncLogError.logDate),
      syncLogError.logMessage,
      syncLogError.scannerSyncedRecordId,
      syncLogError.scannerRecordId,
      syncLogError.recordCreate_userName,
      Date.now()
    )

  if (connectedDatabase === undefined) {
    database.close()
  }
}
