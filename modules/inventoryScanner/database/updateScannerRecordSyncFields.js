import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export function updateScannerRecordSyncFields(recordForm) {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`update InventoryScannerRecords
        set recordSync_isSuccessful = ?,
        recordSync_syncedRecordId = ?,
        recordSync_message = ?
        where recordId = ?
        and recordDelete_timeMillis is null
        and recordSync_timeMillis is not null`)
        .run(recordForm.isSuccessful, recordForm.syncedRecordId, (recordForm.message ?? '').slice(0, 500), recordForm.recordId);
    database.close();
    return result.changes > 0;
}
