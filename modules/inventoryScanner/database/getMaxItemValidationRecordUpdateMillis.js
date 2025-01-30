import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getMaxItemValidationRecordUpdateMillis(itemNumberPrefix = '') {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = database
        .prepare(`select max(recordUpdate_timeMillis)
        from ItemValidationRecords
        where recordDelete_timeMillis is null
        and itemNumberPrefix = ?`)
        .pluck()
        .get(itemNumberPrefix);
    database.close();
    return result ?? 0;
}
