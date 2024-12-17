import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export function markSyncErrorScannerRecordForPending(recordId, updateUser) {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`update InventoryScannerRecords
        set recordSync_userName = null,
        recordSync_timeMillis = null,
        recordSync_message = null,
        recordSync_isSuccessful = null

        where recordId = ?
        and recordDelete_timeMillis is null
        and recordSync_timeMillis is not null
        and recordSync_isSuccessful = 0`)
        .run(recordId);
    database.close();
    return result.changes > 0;
}
