import sqlite from 'better-sqlite3';
import { databasePath } from './databaseHelpers.js';
export default function updateWorkOrderNumberMapping(workOrderNumberMapping) {
    const database = sqlite(databasePath);
    const results = database
        .prepare(`update WorkOrderNumberMappings
        set workOrderNumber = ?,
        exportDate = ?,
        exportTime = ?
        where documentNumber = ?`)
        .run(workOrderNumberMapping.workOrderNumber, workOrderNumberMapping.exportDate, workOrderNumberMapping.exportTime, workOrderNumberMapping.documentNumber);
    database.close();
    return results.changes > 0;
}
