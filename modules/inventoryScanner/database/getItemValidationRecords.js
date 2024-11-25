import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getItemValidationRecords() {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = database
        .prepare(`select itemStoreroom, itemNumber,
        itemDescription, availableQuantity, unitPrice
        from ItemValidationRecords
        where recordDelete_timeMillis is null
        order by itemStoreroom, itemNumber`)
        .all();
    database.close();
    return result;
}
export function getItemValidationRecordsByItemNumber(itemNumber, connectedDatabase) {
    const database = connectedDatabase ??
        sqlite(databasePath, {
            readonly: true
        });
    const result = database
        .prepare(`select itemStoreroom, itemNumber,
        itemDescription, availableQuantity, unitPrice
        from ItemValidationRecords
        where recordDelete_timeMillis is null
        and itemNumber = ?
        order by itemStoreroom`)
        .all(itemNumber);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}
