import sqlite from 'better-sqlite3';
import { databasePath } from './databaseHelpers.js';
export default function getReturnToVendorRecord(returnToVendorRecord) {
    const database = sqlite(databasePath);
    let sql = `select documentNumber, storeroom, itemNumber, transactionDate, quantity, cost
        from ReturnToVendorRecords
        where storeroom = ?
        and itemNumber = ?
        and transactionDate = ?
        and quantity = ?
        and cost = ?`;
    const sqlParameters = [
        returnToVendorRecord.storeroom,
        returnToVendorRecord.itemNumber,
        returnToVendorRecord.transactionDate,
        returnToVendorRecord.quantity,
        returnToVendorRecord.cost
    ];
    if (returnToVendorRecord.documentNumber !== undefined) {
        sql += ' and documentNumber = ?';
        sqlParameters.push(returnToVendorRecord.documentNumber);
    }
    const row = database.prepare(sql).get(...sqlParameters);
    database.close();
    return row;
}
