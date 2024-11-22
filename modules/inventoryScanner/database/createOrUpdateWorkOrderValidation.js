import sqlite from 'better-sqlite3';
import getWorkOrderValidation from './getWorkOrderValidation.js';
import { databasePath } from './helpers.database.js';
export default function createOrUpdateWorkOrderValidation(validationRecord, timeMillis) {
    const database = sqlite(databasePath);
    const databaseRecord = getWorkOrderValidation({
        workOrderNumber: validationRecord.workOrderNumber,
        workOrderType: validationRecord.workOrderType,
        repairId: validationRecord.repairId ?? undefined
    }, true, database);
    if (databaseRecord === undefined) {
        database
            .prepare(`insert into WorkOrderValidationRecords (
          workOrderNumber, workOrderType, workOrderDescription,
          technicianId, technicianDescription,
          repairId, repairDescription,
          recordCreate_timeMillis, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(validationRecord.workOrderNumber, validationRecord.workOrderType, validationRecord.workOrderDescription, validationRecord.technicianId, validationRecord.technicianDescription, validationRecord.repairId, validationRecord.repairDescription, timeMillis, timeMillis);
    }
    else {
        const sqlParameters = [
            validationRecord.workOrderDescription,
            validationRecord.technicianId,
            validationRecord.technicianDescription,
            validationRecord.repairDescription,
            timeMillis,
            validationRecord.workOrderNumber,
            validationRecord.workOrderType
        ];
        if (validationRecord.repairId !== null) {
            sqlParameters.push(validationRecord.repairId);
        }
        database
            .prepare(`update WorkOrderValidationRecords
          set workOrderDescription = ?,
          technicianId = ?,
          technicianDescription = ?,
          repairDescription = ?,
          recordUpdate_timeMillis = ?,
          recordDelete_timeMillis = null
          where workOrderNumber = ?
          and workOrderType = ?
          ${validationRecord.repairId === null ? ' and repairId is null' : ' and repairId = ?'}`)
            .run(sqlParameters);
    }
    database.close();
}