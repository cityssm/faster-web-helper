import { dateIntegerToString, dateToInteger, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
function _getInventoryBatches(filters) {
    const sql = `select b.batchId,

    b.openDate,
    userFunction_dateIntegerToString(b.openDate) as openDateString,
    b.openTime,
    userFunction_timeIntegerToString(b.openTime) as openTimeString,

    b.closeDate,
    userFunction_dateIntegerToString(b.closeDate) as closeDateString,
    b.closeTime,
    userFunction_timeIntegerToString(b.closeTime) as closeTimeString,

    b.recordSync_userName,
    b.recordSync_timeMillis,

    b.recordCreate_userName,
    b.recordCreate_timeMillis,
    b.recordUpdate_userName,
    b.recordUpdate_timeMillis,

    count(i.batchId) as batchItemCount

    from InventoryBatches b

    left join InventoryBatchItems i
      on b.batchId = i.batchId
      and i.recordDelete_timeMillis is null

    where b.recordDelete_timeMillis is null
    ${(filters.whereClause ?? '') === '' ? '' : ' and ' + filters.whereClause}
    
    group by b.batchId, b.openDate, b.openTime, b.closeDate, b.closeTime,
      b.recordSync_userName, b.recordSync_timeMillis,
      b.recordCreate_userName, b.recordCreate_timeMillis,
      b.recordUpdate_userName, b.recordUpdate_timeMillis

    order by b.openDate desc, b.openTime desc, b.batchId desc`;
    const database = sqlite(databasePath, {
        readonly: true
    });
    const batches = database
        .function('userFunction_dateIntegerToString', dateIntegerToString)
        .function('userFunction_timeIntegerToString', timeIntegerToString)
        .prepare(sql)
        .all();
    database.close();
    return batches;
}
const availableMonths = 6;
export function getAvailableInventoryBatches() {
    const availableDate = new Date();
    availableDate.setMonth(availableDate.getMonth() - availableMonths);
    const availableInteger = dateToInteger(availableDate);
    return _getInventoryBatches({
        whereClause: `(
      closeDate is null
        or closeDate >= ${availableInteger}
        or recordSync_timeMillis is null
        or recordSync_timeMillis >= ${availableDate.getTime()}
      )`
    });
}
