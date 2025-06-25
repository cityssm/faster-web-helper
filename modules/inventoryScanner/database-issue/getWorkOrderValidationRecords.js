import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
export default function getWorkOrderValidationRecords(workOrderNumber, workOrderType) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = database
        .prepare(`select workOrderNumber, workOrderType, workOrderDescription,
        technicianId, technicianDescription,
        repairId, repairDescription
        from WorkOrderValidationRecords
        where recordDelete_timeMillis is null
          and workOrderNumber = ?
          and workOrderType = ?`)
        .all(workOrderNumber, workOrderType);
    database.close();
    return result;
}
