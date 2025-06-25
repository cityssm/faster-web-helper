import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
export default function getUnsyncedWorkOrderNumbersAndRepairIds(workOrderType = 'faster') {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const records = database
        .prepare(`select workOrderNumber, repairId from InventoryScannerRecords
        where recordSync_timeMillis is null
        and recordDelete_timeMillis is null
        and workOrderType = ?`)
        .all(workOrderType);
    database.close();
    const workOrderNumberSet = new Set();
    const repairIdSet = new Set();
    for (const record of records) {
        workOrderNumberSet.add(record.workOrderNumber);
        if (record.repairId !== null) {
            repairIdSet.add(record.repairId);
        }
    }
    return {
        workOrderNumbers: [...workOrderNumberSet.values()],
        repairIds: [...repairIdSet.values()]
    };
}
