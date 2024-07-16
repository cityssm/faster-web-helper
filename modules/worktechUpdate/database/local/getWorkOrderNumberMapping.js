import sqlite from 'better-sqlite3';
import { databasePath } from './databaseHelpers.js';
export default function getWorkOrderNumberMapping(documentNumber) {
    const database = sqlite(databasePath);
    const row = database
        .prepare(`select documentNumber, workOrderNumber, exportDate, exportTime
        from WorkOrderNumberMappings
        where documentNumber = ?`)
        .get(documentNumber);
    database.close();
    return row;
}
