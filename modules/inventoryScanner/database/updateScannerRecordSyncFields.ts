import sqlite from 'better-sqlite3'

import { databasePath } from './helpers.database.js'

export interface UpdateScannerRecordSyncFieldsForm {
  recordId: number
  isSuccessful: boolean
  syncedRecordId?: string
  message?: string
}

export function updateScannerRecordSyncFields(
  recordForm: UpdateScannerRecordSyncFieldsForm
): boolean {
  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `update InventoryScannerRecords
        set recordSync_isSuccessful = ?,
        recordSync_syncedRecordId = ?,
        recordSync_message = ?
        where recordId = ?
        and recordDelete_timeMillis is null
        and recordSync_timeMillis is not null`
    )
    .run(
      recordForm.isSuccessful ? 1 : 0,
      recordForm.syncedRecordId,
      (recordForm.message ?? '').slice(0, 500),
      recordForm.recordId
    )

  database.close()

  return result.changes > 0
}
