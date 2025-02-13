import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getMaxDynamicsGpInventoryItemUpdateMillis() {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`select max(recordUpdate_timeMillis)
        from DynamicsGpInventoryItems`)
        .pluck()
        .get();
    database.close();
    return result ?? 0;
}
