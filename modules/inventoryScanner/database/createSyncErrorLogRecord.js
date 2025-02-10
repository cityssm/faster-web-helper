import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function createSyncErrorLogRecord(syncLogError, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(databasePath);
    database
        .prepare(`insert into InventoryScannerSyncErrorLog (
          workOrderType, logId, logDate, logTime, logMessage,
          scannerSyncedRecordId, scannerRecordId,
          recordCreate_userName, recordCreate_timeMillis
        ) 
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(syncLogError.workOrderType, syncLogError.logId, dateToInteger(syncLogError.logDate), dateToTimeInteger(syncLogError.logDate), syncLogError.logMessage, syncLogError.scannerSyncedRecordId, syncLogError.scannerRecordId, syncLogError.recordCreate_userName, Date.now());
    if (connectedDatabase === undefined) {
        database.close();
    }
}
