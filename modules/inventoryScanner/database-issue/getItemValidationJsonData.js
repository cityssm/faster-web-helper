import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
export default function getItemValidationJsonData(itemStoreroom, itemNumber) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = database
        .prepare(`select rawJsonData
        from ItemValidationRecords
        where itemStoreroom = ?
          and itemNumber = ?
          and recordDelete_timeMillis is null`)
        .pluck()
        .get(itemStoreroom, itemNumber);
    database.close();
    return typeof result === 'string' ? JSON.parse(result) : undefined;
}
