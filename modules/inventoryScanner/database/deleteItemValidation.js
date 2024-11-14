import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function deleteItemValidation(minUpdateTimeMillis) {
    const database = sqlite(databasePath);
    database
        .prepare(`update ItemValidationRecords
        set recordDelete_timeMillis = ?
        where recordUpdate_timeMillis < ?`)
        .run(Date.now(), minUpdateTimeMillis);
    database
        .prepare(`delete from ItemValidationRecords
        where recordDelete_timeMillis is not null
        and itemNumber not in (select itemNumber from InventoryScannerRecords)`)
        .run();
    database.close();
}
