import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
export default function deleteExpiredItemValidationRecords(minUpdateTimeMillis) {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`update ItemValidationRecords
        set recordDelete_timeMillis = ?
        where recordUpdate_timeMillis < ?
          and recordDelete_timeMillis is null`)
        .run(Date.now(), minUpdateTimeMillis);
    if (result.changes > 0) {
        database
            .prepare(`delete from ItemValidationRecords
          where recordDelete_timeMillis is not null
            and itemNumber not in (select itemNumber from InventoryScannerRecords)`)
            .run();
    }
    database.close();
}
