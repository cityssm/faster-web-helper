import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
import { getWorkOrderTypeFromWorkOrderNumber } from '../helpers/workOrders.helpers.js';
export function updateScannerRecord(recordForm, updateUser) {
    const database = sqlite(databasePath);
    const workOrderType = recordForm.workOrderType ??
        getWorkOrderTypeFromWorkOrderNumber(recordForm.workOrderNumber);
    const result = database
        .prepare(`update InventoryScannerRecords
        set workOrderNumber = ?,
        workOrderType = ?,
        repairId = ?,
        itemDescription = ?,
        quantity = ?,
        unitPrice = ?,
        recordUpdate_userName = ?,
        recordUpdate_timeMillis = ?
        where recordId = ?
        and recordDelete_timeMillis is null
        and recordSync_timeMillis is null`)
        .run(recordForm.workOrderNumber, workOrderType, recordForm.repairId === '' ? undefined : recordForm.repairId, recordForm.itemDescription, recordForm.quantity, recordForm.unitPrice === '' ? undefined : recordForm.unitPrice, updateUser.userName, Date.now(), recordForm.recordId);
    database.close();
    return result.changes > 0;
}
