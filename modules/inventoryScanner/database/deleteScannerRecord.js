import sqlite from 'better-sqlite3';
import { scannerKeyToUserName } from '../helpers/scanner.js';
import { databasePath } from './helpers.database.js';
export default function deleteScannerRecord(recordId, deleteUser, scannerKey) {
    const database = sqlite(databasePath);
    let userName = '';
    if (deleteUser !== undefined) {
        userName = deleteUser.userName;
    }
    else if (scannerKey !== undefined) {
        userName = scannerKeyToUserName(scannerKey);
    }
    const sqlParameters = [userName, Date.now(), recordId];
    let scannerKeyWhereClause = '';
    if (scannerKey !== undefined) {
        scannerKeyWhereClause = ' and scannerKey = ?';
        sqlParameters.push(scannerKey);
    }
    const result = database
        .prepare(`update InventoryScannerRecords
        set recordDelete_userName = ?,
        recordDelete_timeMillis = ?
        where recordId = ?
        and recordDelete_timeMillis is null
        and recordSync_timeMillis is null
        ${scannerKeyWhereClause}`)
        .run(sqlParameters);
    database.close();
    return result.changes > 0;
}
