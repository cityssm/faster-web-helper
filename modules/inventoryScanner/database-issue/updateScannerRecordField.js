import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
export function updateScannerRecordField(recordId, fieldToUpdate, fieldValue, updateUserName) {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`update InventoryScannerRecords
        set ${fieldToUpdate} = ?,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where recordId = ?
          and recordDelete_timeMillis is null
          and recordSync_timeMillis is null`)
        .run(fieldValue, updateUserName, Date.now(), recordId);
    database.close();
    return result.changes > 0;
}
