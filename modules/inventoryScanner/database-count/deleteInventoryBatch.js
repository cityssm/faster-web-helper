import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
export default function deleteInventoryBatch(batchId, user) {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`update InventoryBatches
        set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
        where batchId = ?
          and recordSync_timeMillis is null
          and recordDelete_timeMillis is null`)
        .run(user.userName, Date.now(), batchId);
    database.close();
    return result.changes > 0;
}
