import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
const defaultOptions = {
    limit: 20
};
export default function getScannerRecords(filters, userOptions = {}) {
    const options = {
        ...defaultOptions,
        ...userOptions
    };
    const sqlParameters = [];
    let sqlWhereClause = 'where s.recordDelete_timeMillis is null';
    if (filters.scannerKey !== undefined) {
        sqlWhereClause += ' and s.scannerKey = ?';
        sqlParameters.push(filters.scannerKey);
    }
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = database
        .function('userFunction_dateIntegerToString', dateIntegerToString)
        .function('userFunction_timeIntegerToString', timeIntegerToString)
        .prepare(`select s.recordId, s.scannerKey,
        s.scanDate, userFunction_dateIntegerToString(s.scanDate) as scanDateString,
        s.scanTime, userFunction_timeIntegerToString(s.scanTime) as scanTimeString,
        s.workOrderNumber, s.workOrderType,
        s.technicianId,
        s.repairId, w.repairDescription,
        s.itemStoreroom, s.itemNumber, i.itemDescription,
        s.quantity, s.unitPrice,
        s.recordSync_userName, s.recordSync_timeMillis, s.recordSync_isSuccessful,
        s.recordSync_syncedRecordId, s.recordSync_message
        from InventoryScannerRecords s
        left join ItemValidationRecords i
          on s.itemStoreroom = i.itemStoreroom
          and s.itemNumber = i.itemNumber
          and i.recordDelete_timeMillis is null
        left join WorkOrderValidationRecords w
          on s.workOrderNumber = w.workOrderNumber
          and s.workOrderType = w.workOrderType
          and s.repairId = w.repairId
          and w.recordDelete_timeMillis is null
        ${sqlWhereClause}
        order by s.scanDate desc, s.scanTime desc, s.recordId desc
        limit ${options.limit}`)
        .all(sqlParameters);
    database.close();
    return result;
}
