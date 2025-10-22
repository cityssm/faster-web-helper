import { updateScannerRecordSyncFields } from '../../database-issue/updateScannerRecordSyncFields.js'
import type { InventoryScannerRecord, WorkOrderType } from '../../types.js'

export function updateMultipleScannerRecords(
  records: InventoryScannerRecord[],
  recordIdsToSkip: Set<number>,
  fields: {
    workOrderType: WorkOrderType
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
      workOrderType: fields.workOrderType,
      isSuccessful: fields.isSuccessful,
      syncedRecordId: fields.syncedRecordId,
      message: fields.message
    })
  }
}
