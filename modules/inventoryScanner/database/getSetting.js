import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getSetting(settingName) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const settingValue = database
        .prepare(`select settingValue
        from InventoryScannerSettings
        where settingName = ?`)
        .pluck()
        .get(settingName);
    database.close();
    return settingValue;
}
