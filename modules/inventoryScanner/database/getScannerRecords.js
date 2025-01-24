import { dateIntegerToString, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
const defaultOptions = {
    limit: -1
};
export default function getScannerRecords(filters, userOptions = {}) {
    const options = {
        ...defaultOptions,
        ...userOptions
    };
    /*
     * Filters
     */
    const sqlParameters = [];
    let sqlWhereClause = 'where s.recordDelete_timeMillis is null';
    if (filters.scannerKey !== undefined) {
        sqlWhereClause += ' and s.scannerKey = ?';
        sqlParameters.push(filters.scannerKey);
    }
    if (filters.isSynced !== undefined) {
        sqlWhereClause += filters.isSynced
            ? ' and s.recordSync_timeMillis is not null'
            : ' and s.recordSync_timeMillis is null';
    }
    if (filters.isSyncedSuccessfully !== undefined) {
        sqlWhereClause += ' and s.recordSync_isSuccessful = ?';
        sqlParameters.push(filters.isSyncedSuccessfully ? 1 : 0);
    }
    if (filters.isMarkedForSync !== undefined) {
        sqlWhereClause += filters.isMarkedForSync
            ? ' and s.recordSync_timeMillis is not null and recordSync_isSuccessful is null'
            : ' and (s.recordSync_timeMillis is null or s.recordSync_isSuccessful is not null)';
    }
    if (filters.hasMissingValidation !== undefined) {
        sqlWhereClause += filters.hasMissingValidation
            ? ` and (
          (s.workOrderType = 'faster' and (s.repairId is null or w.repairDescription is null))
          or s.itemStoreRoom is null
          or s.unitPrice is null
          or i.itemDescription is null
          )`
            : `and (
          (s.workOrderType <> 'faster' or (s.repairId is not null and w.repairDescription is not null))
          and s.itemStoreroom is not null
          and s.unitPrice is not null
          and i.itemDescription is not null
          )`;
    }
    if (filters.workOrderType !== undefined) {
        sqlWhereClause += ' and s.workOrderType = ?';
        sqlParameters.push(filters.workOrderType);
    }
    /*
     * Build SQL
     */
    let sql = `select s.recordId, s.scannerKey,
      s.scanDate, userFunction_dateIntegerToString(s.scanDate) as scanDateString,
      s.scanTime, userFunction_timeIntegerToString(s.scanTime) as scanTimeString,
      s.workOrderNumber, s.workOrderType,
      s.technicianId,
      s.repairId, w.repairDescription,
      s.itemStoreroom, s.itemNumber,
      case
        when s.itemDescription is null or s.itemDescription = '' then i.itemDescription
        else s.itemDescription
        end as itemDescription,
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
    order by s.scanDate desc, s.scanTime desc, s.recordId desc`;
    if (options.limit !== -1) {
        sql += ` limit ${options.limit.toString()}`;
    }
    /*
     * Do Query
     */
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = database
        .function('userFunction_dateIntegerToString', dateIntegerToString)
        .function('userFunction_timeIntegerToString', timeIntegerToString)
        .prepare(sql)
        .all(sqlParameters);
    database.close();
    return result;
}
