import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getSetting(settingName) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const settingValue = database
        .prepare(`select settingValue
        from InventoryScannerSettings
        where settingName = ?`)
        .pluck()
        .get(settingName);
    database.close();
    return settingValue;
}
export function getSettingValues(settingName) {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const settingValues = database
        .prepare(`select previousSettingValue, settingValue
        from InventoryScannerSettings
        where settingName = ?`)
        .get(settingName);
    database.close();
    return settingValues;
}
