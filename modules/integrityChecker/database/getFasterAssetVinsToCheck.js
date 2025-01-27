import sqlite from 'better-sqlite3';
import { databasePath } from './helpers.database.js';
export default function getFasterAssetVinsToCheck() {
    const database = sqlite(databasePath, {
        readonly: true
    });
    const result = database
        .prepare(`select vinSerial, year from FasterAssets
        where vinSerialIsValid = 1
        and vinSerial not in (select vin from NhtsaVehicles)`)
        .all();
    database.close();
    return result;
}
