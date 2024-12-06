import { updateScannerRecordSyncFields } from '../../database/updateScannerRecordSyncFields.js';
export function updateMultipleScannerRecords(records, recordIdsToSkip, fields) {
    for (const record of records) {
        if (recordIdsToSkip.has(record.recordId)) {
            continue;
        }
        updateScannerRecordSyncFields({
            recordId: record.recordId,
            isSuccessful: fields.isSuccessful,
            syncedRecordId: fields.syncedRecordId,
            message: fields.message
        });
    }
}
