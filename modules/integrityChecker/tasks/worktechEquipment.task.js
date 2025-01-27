import { minutesToMillis } from '@cityssm/to-millis';
import { WorkTechAPI } from '@cityssm/worktech-api';
import sqlite from 'better-sqlite3';
import camelCase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import schedule from 'node-schedule';
import { DEBUG_NAMESPACE } from '../../../debug.config.js';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { getScheduledTaskMinutes } from '../../../helpers/tasks.helpers.js';
import { createOrUpdateWorktechEquipment } from '../database/createOrUpdateWorktechEquipment.js';
import { deleteExpiredRecords } from '../database/deleteExpiredRecords.js';
import getFasterAssetNumbers from '../database/getFasterAssetNumbers.js';
import getMaxWorktechEquipmentUpdateMillis from '../database/getMaxWorktechEquipmentUpdateMillis.js';
import { databasePath } from '../database/helpers.database.js';
import { moduleName } from '../helpers/module.helpers.js';
const minimumMillisBetweenRuns = minutesToMillis(45);
let lastRunMillis = getMaxWorktechEquipmentUpdateMillis();
export const taskName = 'Active Worktech Equipment Task';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`);
const worktechConfig = getConfigProperty('worktech');
async function refreshWorktechEquipment() {
    if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
        debug('Skipping run.');
        return;
    }
    debug(`Running "${taskName}"...`);
    if (worktechConfig === undefined) {
        debug('Missing Worktech configuration.');
        return;
    }
    const fasterAssetNumbers = getFasterAssetNumbers();
    if (fasterAssetNumbers.length === 0) {
        debug('No FASTER assets found.');
        return;
    }
    const database = sqlite(databasePath);
    const rightNow = Date.now();
    const worktech = new WorkTechAPI(worktechConfig);
    for (const assetNumber of fasterAssetNumbers) {
        const worktechEquipment = await worktech.getEquipmentByEquipmentId(assetNumber);
        if (worktechEquipment === undefined) {
            continue;
        }
        createOrUpdateWorktechEquipment({
            equipmentSystemId: worktechEquipment.equipmentSystemId,
            equipmentId: worktechEquipment.equipmentId,
            vinSerial: worktechEquipment.serialNumber,
            license: worktechEquipment.plate,
            year: worktechEquipment.equipmentModelYear,
            make: worktechEquipment.equipmentBrand,
            model: worktechEquipment.equipmentModel,
            recordUpdate_timeMillis: rightNow
        }, database);
    }
    /*
     * Delete expired records
     */
    const deleteCount = deleteExpiredRecords('WorktechEquipment', rightNow, database);
    if (deleteCount > 0) {
        debug(`Deleted ${deleteCount} expired Worktech equipment records.`);
    }
    database.close();
    lastRunMillis = Date.now();
    debug(`Finished "${taskName}".`);
}
const job = schedule.scheduleJob(taskName, {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('integrityChecker.worktechEquipment'),
    second: 0
}, refreshWorktechEquipment);
exitHook(() => {
    try {
        job.cancel();
    }
    catch {
        // ignore
    }
});
process.on('message', (_message) => {
    debug('Received message.');
    void refreshWorktechEquipment();
});
