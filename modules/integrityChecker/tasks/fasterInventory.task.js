import { FasterUnofficialAPI } from '@cityssm/faster-unofficial-api';
import { ScheduledTask } from '@cityssm/scheduled-task';
import sqlite from 'better-sqlite3';
import camelCase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../debug.config.js';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { getMinimumMillisBetweenRuns, getScheduledTaskMinutes } from '../../../helpers/tasks.helpers.js';
import { createOrUpdateFasterInventoryItem } from '../database/createOrUpdateFasterInventoryItem.js';
import { deleteExpiredRecords } from '../database/deleteExpiredRecords.js';
import getMaxFasterInventoryItemUpdateMillis from '../database/getMaxFasterInventoryItemUpdateMillis.js';
import { databasePath, timeoutMillis } from '../database/helpers.database.js';
import { moduleName } from '../helpers/module.helpers.js';
export const taskName = 'Integrity Checker - FASTER Inventory';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`);
const fasterWebConfig = getConfigProperty('fasterWeb');
async function refreshFasterInventory() {
    if (fasterWebConfig.appUserName === undefined ||
        fasterWebConfig.appPassword === undefined) {
        debug('Missing FASTER app user configuration.');
        return;
    }
    /*
     * Call FASTER Unofficial API
     */
    const fasterAPI = new FasterUnofficialAPI(fasterWebConfig.tenantOrBaseUrl, fasterWebConfig.appUserName, fasterWebConfig.appPassword);
    const fasterInventoryResponse = await fasterAPI.getInventory();
    /*
     * Update the database
     */
    debug(`Updating ${fasterInventoryResponse.length} FASTER inventory records...`);
    const database = sqlite(databasePath, {
        timeout: timeoutMillis
    });
    const rightNowMillis = Date.now();
    for (const storeroom of fasterInventoryResponse) {
        for (const item of storeroom.items) {
            createOrUpdateFasterInventoryItem({
                itemNumber: item.itemNumber,
                storeroom: storeroom.storeroom,
                itemName: item.itemName,
                binLocation: item.binLocation,
                averageTrueCost: item.averageTrueCost,
                quantityInStock: item.quantityInStock,
                recordUpdate_timeMillis: rightNowMillis
            }, database);
        }
    }
    /*
     * Delete expired assets
     */
    const deleteCount = deleteExpiredRecords('FasterInventoryItems', rightNowMillis, database);
    if (deleteCount > 0) {
        debug(`Deleted ${deleteCount} expired items.`);
    }
    /*
     * Run validation task
     */
    const validationSource = getConfigProperty('modules.integrityChecker.fasterInventory.validation.source');
    if (validationSource === 'dynamicsGp') {
        const dynamicsGpValidation = await import('../helpers/inventoryValidation/dynamicsGp.js');
        await dynamicsGpValidation.refreshDynamicsGpInventory(database);
    }
    else if (validationSource !== '') {
        debug(`Unknown validation source: ${validationSource}`);
    }
    database.close();
}
const scheduledTask = new ScheduledTask(taskName, refreshFasterInventory, {
    schedule: {
        dayOfWeek: getConfigProperty('application.workDays'),
        hour: getConfigProperty('application.workHours'),
        minute: getScheduledTaskMinutes('integrityChecker_fasterInventory'),
        second: 0
    },
    lastRunMillis: getMaxFasterInventoryItemUpdateMillis(),
    minimumIntervalMillis: getMinimumMillisBetweenRuns('integrityChecker_fasterInventory'),
    startTask: true
});
/*
 * Run the task on initialization
 */
void scheduledTask.runTask();
