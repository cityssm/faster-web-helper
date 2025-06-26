import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
import { getOpenedInventoryBatch } from './getInventoryBatch.js';
export default function reopenInventoryBatch(batchId, user) {
    const openBatch = getOpenedInventoryBatch(false, false, user);
    if (openBatch !== undefined) {
        return {
            success: false,
            message: 'Another inventory batch is already open.'
        };
    }
    const database = sqlite(databasePath);
    const result = database
        .prepare(`update InventoryBatches
        set closeDate = null,
          closeTime = null,
          recordUpdate_userName = ?,
          recordUpdate_timeMillis = ?
        where batchId = ?
          and closeDate is not null
          and recordSync_timeMillis is null
          and recordDelete_timeMillis is null`)
        .run(user.userName, Date.now(), batchId);
    database.close();
    return {
        success: result.changes > 0
    };
}
