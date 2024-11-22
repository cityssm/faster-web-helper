import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getWorkOrderValidationRepairIds(workOrderNumbers, workOrderType = 'faster') {
    const workOrderWhereClause = [];
    const sqlParameters = [workOrderType];
    for (const workOrderNumber of workOrderNumbers) {
        workOrderWhereClause.push('workOrderNumber = ?');
        sqlParameters.push(workOrderNumber);
    }
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = database
        .prepare(`select repairId
        from WorkOrderValidationRecords
        where recordDelete_timeMillis is null
        and repairId is not null
        and workOrderType = ?
        and (${workOrderWhereClause.join(' or ')})`)
        .all(sqlParameters);
    database.close();
    return result;
}
