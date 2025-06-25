import sqlite from 'better-sqlite3';
import { databasePath } from '../helpers/database.helpers.js';
export default function deleteSetting(settingName) {
    const database = sqlite(databasePath);
    const result = database
        .prepare(`delete from InventoryScannerSettings
        where settingName = ?`)
        .run(settingName);
    database.close();
    return result.changes > 0;
}
