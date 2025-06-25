import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
export default function getWorkOrderValidation(validationRecord, includeDeleted, connectedDatabase) {
    const database = connectedDatabase ??
        sqlite(databasePath, {
            readonly: true
        });
    const sqlParameters = [
        validationRecord.workOrderNumber,
        validationRecord.workOrderType
    ];
    if (validationRecord.repairId !== undefined) {
        sqlParameters.push(validationRecord.repairId);
    }
    const result = database
        .prepare(`select workOrderNumber, workOrderType, workOrderDescription,
        technicianId, technicianDescription,
        repairId, repairDescription
        from WorkOrderValidationRecords
        where workOrderNumber = ?
        and workOrderType = ?
        ${validationRecord.repairId === undefined ? ' and repairId is null' : ' and repairId = ?'}
        ${includeDeleted ? '' : ' and recordDelete_timeMillis is not null'}`)
        .get(sqlParameters);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}
