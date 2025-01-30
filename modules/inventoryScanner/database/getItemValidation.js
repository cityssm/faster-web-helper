import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getItemValidation(itemStoreroom, itemNumber, includeDeleted, connectedDatabase) {
    const database = connectedDatabase ??
        sqlite(databasePath, {
            readonly: true
        });
    const result = database
        .prepare(`select itemStoreroom, itemNumberPrefix, itemNumber,
        itemDescription, availableQuantity, unitPrice
        from ItemValidationRecords
        where itemStoreroom = ?
        and itemNumber = ?
        ${includeDeleted ? '' : ' and recordDelete_timeMillis is not null'}`)
        .get(itemStoreroom, itemNumber);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}
