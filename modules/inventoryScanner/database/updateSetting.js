import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function updateSetting(settingName, settingValue) {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`update InventoryScannerSettings
        set settingValue = ?,
        recordUpdate_timeMillis = ?
        where settingName = ?`)
        .run(settingValue, Date.now(), settingName);
    if (result.changes <= 0) {
        database
            .prepare(`insert into InventoryScannerSettings
          (settingName, settingValue, recordUpdate_timeMillis)
          values (?, ?, ?)`)
            .run(settingName, settingValue, Date.now());
    }
    database.close();
    return true;
}
