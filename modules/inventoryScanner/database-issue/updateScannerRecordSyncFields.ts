import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'
import type { WorkOrderType } from '../types.js'

export interface UpdateScannerRecordSyncFieldsForm {
  recordId: number
  workOrderType: WorkOrderType
  isSuccessful: boolean
  syncedRecordId?: string
  message?: string
}

export function updateScannerRecordSyncFields(
  recordForm: UpdateScannerRecordSyncFieldsForm,
  connectedDatabase?: sqlite.Database
): boolean {
  const database = connectedDatabase ?? sqlite(databasePath)

  let result = database
    .prepare(
      `update InventoryScannerRecords
        set recordSync_isSuccessful = ?,
          recordSync_syncedRecordId = ?,
          recordSync_message = ?
        where recordId = ?
          and workOrderType = ?
          and recordDelete_timeMillis is null
          ${recordForm.isSuccessful ? ' and recordSync_timeMillis is not null' : ''}`
    )
    .run(
      recordForm.isSuccessful ? 1 : 0,
      recordForm.syncedRecordId,
      (recordForm.message ?? '').slice(0, 500),
      recordForm.recordId,
      recordForm.workOrderType
    )

  if (result.changes === 0) {
    result = database
      .prepare(
        `update InventoryScannerRecords
          set secondaryRecordSync_isSuccessful = ?,
            secondaryRecordSync_syncedRecordId = ?,
            secondaryRecordSync_message = ?
          where recordId = ?
            and secondaryWorkOrderType = ?
            and recordDelete_timeMillis is null
            ${recordForm.isSuccessful ? ' and secondaryRecordSync_timeMillis is not null' : ''}`
      )
      .run(
        recordForm.isSuccessful ? 1 : 0,
        recordForm.syncedRecordId,
        (recordForm.message ?? '').slice(0, 500),
        recordForm.recordId,
        recordForm.workOrderType
      )
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result.changes > 0
}
