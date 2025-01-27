import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getFasterAssets() {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = database
        .prepare(`select assetNumber, organization,
        vinSerial, vinSerialIsValid,
        license, year, make, model,
        recordUpdate_timeMillis
        from FasterAssets`)
        .all();
    database.close();
    return result;
}
