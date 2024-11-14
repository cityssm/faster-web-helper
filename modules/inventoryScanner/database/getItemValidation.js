import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getItemValidation(itemStoreroom, itemNumber, includeDeleted, connectedDatabase) {
    const database = connectedDatabase ?? sqlite(databasePath);
    const result = database
        .prepare(`select itemStoreroom, itemNumber,
        itemDescription, availableQuantity, unitPrice
        from ItemValidationRecords
        where itemStoreroom = ?
        and itemNumber = ?
        ${includeDeleted ? '' : ' and recordDelete_timeMillis in not null'}`)
        .get(itemStoreroom, itemNumber);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}
