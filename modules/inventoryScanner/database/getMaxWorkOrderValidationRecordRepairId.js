import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getMaxWorkOrderValidationRepairId(workOrderType = 'faster') {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`select max(repairId)
        from WorkOrderValidationRecords
        where workOrderType = ?
        and repairId is not null`)
        .pluck()
        .get(workOrderType);
    database.close();
    return result ?? 0;
}
