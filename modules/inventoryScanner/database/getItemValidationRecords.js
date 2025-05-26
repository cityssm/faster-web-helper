import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getItemValidationRecords(itemNumberPrefix) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    let sql = `select itemStoreroom, itemNumberPrefix, itemNumber,
    itemDescription, availableQuantity, unitPrice
    from ItemValidationRecords
    where recordDelete_timeMillis is null`;
    const sqlParameters = [];
    if (itemNumberPrefix !== undefined) {
        sql += ' and itemNumberPrefix = ?';
        sqlParameters.push(itemNumberPrefix);
    }
    sql += ' order by itemStoreroom, itemNumber';
    const result = database
        .prepare(sql)
        .all(sqlParameters);
    database.close();
    return result;
}
export function getItemValidationRecordsByItemNumber(itemNumber, itemNumberPrefix, connectedDatabase) {
    const database = connectedDatabase ??
        sqlite(databasePath, {
            readonly: true
        });
    const result = database
        .prepare(`select itemStoreroom, itemNumberPrefix, itemNumber,
        itemDescription, availableQuantity, unitPrice
        from ItemValidationRecords
        where recordDelete_timeMillis is null
        and itemNumber = ?
        and itemNumberPrefix = ?
        order by itemStoreroom`)
        .all(itemNumber, itemNumberPrefix);
    if (connectedDatabase === undefined) {
        database.close();
    }
    return result;
}
