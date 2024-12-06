import { updateScannerRecordSyncFields } from '../../database/updateScannerRecordSyncFields.js'
import type { InventoryScannerRecord } from '../../types.js'

export function updateMultipleScannerRecords(
  records: InventoryScannerRecord[],
  recordIdsToSkip: Set<number>,
  fields: {
    isSuccessful: boolean
    syncedRecordId?: string
    message?: string
  }
): void {
  for (const record of records) {
    if (recordIdsToSkip.has(record.recordId)) {
      continue
    }

    updateScannerRecordSyncFields({
      recordId: record.recordId,
      isSuccessful: fields.isSuccessful,
      syncedRecordId: fields.syncedRecordId,
      message: fields.message
    })
  }
}
