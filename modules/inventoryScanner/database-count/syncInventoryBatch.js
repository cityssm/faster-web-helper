import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
export default function syncInventoryBatch(batchId, user) {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`update InventoryBatches
        set recordSync_userName = ?,
          recordSync_timeMillis = ?
        where batchId = ?
          and closeDate is not null
          and recordSync_timeMillis is null
          and recordDelete_timeMillis is null`)
        .run(user.userName, Date.now(), batchId);
    if (result.changes > 0) {
        database
            .prepare(`delete from InventoryBatchItems
          where batchId = ?
            and recordDelete_timeMillis is not null`)
            .run(batchId);
    }
    database.close();
    return result.changes > 0;
}
