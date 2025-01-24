import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export function updateScannerRecord(recordForm, updateUser) {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`update InventoryScannerRecords
        set workOrderNumber = ?,
        repairId = ?,
        itemNumber = ?,
        itemDescription = ?,
        quantity = ?,
        unitPrice = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordId = ?
        and recordDelete_timeMillis is null
        and recordSync_timeMillis is null`)
        .run(recordForm.workOrderNumber, recordForm.repairId === '' ? undefined : recordForm.repairId, recordForm.itemNumber, recordForm.itemDescription, recordForm.quantity, recordForm.unitPrice === '' ? undefined : recordForm.unitPrice, updateUser.userName, Date.now(), recordForm.recordId);
    database.close();
    return result.changes > 0;
}
