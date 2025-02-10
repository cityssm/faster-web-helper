import sqlite from 'better-sqlite3';
import camelcase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../debug.config.js';
import { moduleName } from '../helpers/module.helpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelcase(moduleName)}:databaseHelpers`);
export const databasePath = 'data/inventoryScanner.db';
const createStatements = [
    `create table if not exists ItemValidationRecords (
    itemStoreroom varchar(3) not null,
    itemNumberPrefix varchar(3) not null default '',
    itemNumber varchar(22) not null,
    itemDescription varchar(40) not null default '',
    availableQuantity integer not null default 0,
    unitPrice decimal(18, 4) not null default 0,
    recordCreate_timeMillis integer not null,
    recordUpdate_timeMillis integer not null,
    recordDelete_timeMillis integer,
    primary key (itemStoreroom, itemNumber))`,
    `create table if not exists WorkOrderValidationRecords (
    workOrderNumber varchar(15) not null,
    workOrderType varchar(10) not null default 'faster',
    workOrderDescription varchar(500) not null default '',
    repairId integer,
    repairDescription varchar(500),
    technicianId varchar(22),
    technicianDescription varchar(500),
    recordCreate_timeMillis integer not null,
    recordUpdate_timeMillis integer not null,
    recordDelete_timeMillis integer,
    primary key (repairId, workOrderType, workOrderNumber))`,
    `create table if not exists InventoryScannerRecords (
    recordId integer primary key autoincrement,
    scannerKey char(10) not null,
    scanDate integer not null,
    scanTime integer not null,

    workOrderNumber varchar(15) not null,
    workOrderType varchar(10) not null default 'faster',
    technicianId varchar(22),
    repairId integer,

    itemStoreroom varchar(3),
    itemNumberPrefix varchar(3) not null default '',
    itemNumber varchar(22) not null,
    itemDescription varchar(40),
    quantity integer not null,
    unitPrice decimal(18, 4),
    
    recordSync_userName varchar(20),
    recordSync_timeMillis integer,
    recordSync_isSuccessful bit,
    recordSync_syncedRecordId varchar(50),
    recordSync_message varchar(500),

    recordCreate_userName varchar(20) not null default '',
    recordCreate_timeMillis integer not null,
    recordUpdate_userName varchar(20) not null default '',
    recordUpdate_timeMillis integer not null,
    recordDelete_userName varchar(20),
    recordDelete_timeMillis integer)`,
    `create table if not exists InventoryScannerSyncErrorLog (
    recordId integer primary key autoincrement,
    workOrderType varchar(10) not null default 'faster',

    logId varchar(10) not null,
    logDate integer not null,
    logTime integer not null,
    logMessage varchar(500) not null,

    scannerSyncedRecordId varchar(50),
    scannerRecordId integer,
    
    recordCreate_userName varchar(20) not null default '',
    recordCreate_timeMillis integer not null,
    recordDelete_userName varchar(20),
    recordDelete_timeMillis integer,
    
    unique (workOrderType, logId))`,
    `create table if not exists InventoryScannerSettings (
    settingName varchar(100) not null primary key,
    settingValue varchar(500),
    previousSettingValue varchar(500),
    recordUpdate_timeMillis integer not null)`
];
export function initializeInventoryScannerDatabase() {
    debug(`Checking for ${databasePath}`);
    let success = false;
    const database = sqlite(databasePath);
    const row = database
        .prepare(`select name from sqlite_master
        where type = 'table'
        and name = 'InventoryScannerSettings'`)
        .get();
    if (row === undefined) {
        debug(`Creating ${databasePath}`);
        for (const sql of createStatements) {
            database.prepare(sql).run();
        }
        success = true;
    }
    database.close();
    return success;
}
