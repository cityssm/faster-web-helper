import { ScheduledTask } from '@cityssm/scheduled-task';
import { WorkTechAPI } from '@cityssm/worktech-api';
import sqlite from 'better-sqlite3';
import camelCase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../../debug.config.js';
import { getConfigProperty } from '../../../../helpers/config.helpers.js';
import { getMinimumMillisBetweenRuns, getScheduledTaskMinutes } from '../../../../helpers/tasks.helpers.js';
import { createOrUpdateWorktechEquipment } from '../../database/createOrUpdateWorktechEquipment.js';
import { deleteExpiredRecords } from '../../database/deleteExpiredRecords.js';
import getFasterAssetNumbers from '../../database/getFasterAssetNumbers.js';
import getMaxWorktechEquipmentUpdateMillis from '../../database/getMaxWorktechEquipmentUpdateMillis.js';
import { databasePath, timeoutMillis } from '../../database/helpers.database.js';
import { moduleName } from '../../helpers/module.helpers.js';
export const taskName = 'Integrity Checker - Active Worktech Equipment';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`);
const worktechConfig = getConfigProperty('worktech');
async function refreshWorktechEquipment() {
    if (worktechConfig === undefined) {
        debug('Missing Worktech configuration.');
        return;
    }
    const fasterAssetNumbers = getFasterAssetNumbers();
    if (fasterAssetNumbers.length === 0) {
        debug('No FASTER assets found.');
        return;
    }
    const database = sqlite(databasePath, {
        timeout: timeoutMillis
    });
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
            make: worktechEquipment.equipmentBrand,
            model: worktechEquipment.equipmentModel,
            year: worktechEquipment.equipmentModelYear,
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
}
const scheduledTask = new ScheduledTask(taskName, refreshWorktechEquipment, {
    schedule: {
        dayOfWeek: getConfigProperty('application.workDays'),
        hour: getConfigProperty('application.workHours'),
        minute: getScheduledTaskMinutes('integrityChecker_worktechEquipment'),
        second: 0
    },
    lastRunMillis: getMaxWorktechEquipmentUpdateMillis(),
    minimumIntervalMillis: getMinimumMillisBetweenRuns('integrityChecker_worktechEquipment'),
    startTask: true
});
process.on('message', (_message) => {
    debug('Received message.');
    void scheduledTask.runTask();
});
