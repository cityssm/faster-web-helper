import { dateIntegerToString, dateToInteger, dateToTimeInteger, timeIntegerToString } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getInventoryBatchItems } from './getInventoryBatchItems.js';
import { databasePath } from './helpers.database.js';
function _getInventoryBatch(filters, includeBatchItems = false, connectedDatabase) {
    const sqlParameters = [];
    let sql = `select batchId,

    openDate,
    userFunction_dateIntegerToString(openDate) as openDateString,
    openTime,
    userFunction_timeIntegerToString(openTime) as openTimeString,

    closeDate,
    userFunction_dateIntegerToString(closeDate) as closeDateString,
    closeTime,
    userFunction_timeIntegerToString(closeTime) as closeTimeString,

    recordSync_userName,
    recordSync_timeMillis,

    recordCreate_userName,
    recordCreate_timeMillis,
    recordUpdate_userName,
    recordUpdate_timeMillis

    from InventoryBatches
    where recordDelete_timeMillis is null`;
    if (Object.hasOwn(filters, 'isOpened') && filters.isOpened === true) {
        sql += ' and closeDate is null';
    }
    if (filters.batchId !== undefined) {
        sql += ' and batchId = ?';
        sqlParameters.push(filters.batchId);
    }
    const database = connectedDatabase ??
        sqlite(databasePath, {
            readonly: true
        });
    const result = database
        .function('userFunction_dateIntegerToString', dateIntegerToString)
        .function('userFunction_timeIntegerToString', timeIntegerToString)
        .prepare(sql)
        .get(...sqlParameters);
    if (result !== undefined && includeBatchItems) {
        result.batchItems = getInventoryBatchItems(result.batchId, database);
    }
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}
export default function getInventoryBatch(batchId) {
    return _getInventoryBatch({ batchId }, true);
}
export function getOpenedInventoryBatch(includeBatchItems = false, createIfNotExists = false, user) {
    const database = sqlite(databasePath);
    let openBatch = _getInventoryBatch({ isOpened: true }, includeBatchItems, database);
    if (openBatch === undefined && createIfNotExists) {
        const rightNow = new Date();
        const result = database
            .prepare(`insert into InventoryBatches (
          openDate, openTime,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis
        ) values (
          ?, ?,
          ?, ?,
          ?, ?
        )`)
            .run(dateToInteger(rightNow), dateToTimeInteger(rightNow), user?.userName ?? 'scanner', Date.now(), user?.userName ?? 'scanner', Date.now());
        const newBatchId = result.lastInsertRowid;
        openBatch = _getInventoryBatch({ batchId: newBatchId }, false);
        if (openBatch === undefined) {
            return undefined;
        }
        openBatch.batchItems = [];
    }
    database.close();
    return openBatch;
}
