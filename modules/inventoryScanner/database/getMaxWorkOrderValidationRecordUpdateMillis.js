import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getMaxWorkOrderValidationRecordUpdateMillis() {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`select max(recordUpdate_timeMillis)
        from WorkOrderValidationRecords
        where recordDelete_timeMillis is null`)
        .pluck()
        .get();
    database.close();
    return result ?? 0;
}
