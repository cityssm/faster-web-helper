import { FasterApi } from '@cityssm/faster-api';
import { ScheduledTask } from '@cityssm/scheduled-task';
import { isValidVin } from '@shaggytools/nhtsa-api-wrapper';
import sqlite from 'better-sqlite3';
import camelCase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../debug.config.js';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { getMinimumMillisBetweenRuns, getScheduledTaskMinutes } from '../../../helpers/tasks.helpers.js';
import { createOrUpdateFasterAsset } from '../database/createOrUpdateFasterAsset.js';
import { deleteExpiredRecords } from '../database/deleteExpiredRecords.js';
import getMaxFasterAssetUpdateMillis from '../database/getMaxFasterAssetUpdateMillis.js';
import { databasePath, timeoutMillis } from '../database/helpers.database.js';
import { moduleName } from '../helpers/module.helpers.js';
export const taskName = 'Integrity Checker - Active FASTER Assets';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`);
const fasterWebConfig = getConfigProperty('fasterWeb');
async function refreshFasterAssets() {
    if (fasterWebConfig.apiUserName === undefined ||
        fasterWebConfig.apiPassword === undefined) {
        debug('Missing FASTER API user configuration.');
        return;
    }
    /*
     * Call FASTER API
     */
    const fasterApi = new FasterApi(fasterWebConfig.tenantOrBaseUrl, fasterWebConfig.apiUserName, fasterWebConfig.apiPassword);
    const fasterAssetsResponse = await fasterApi.getActiveAssets();
    if (!fasterAssetsResponse.success) {
        debug(`API Error: ${fasterAssetsResponse.error.title}`);
        return;
    }
    /*
     * Update the database
     */
    debug(`Updating ${fasterAssetsResponse.response.results.length} FASTER asset records...`);
    const database = sqlite(databasePath, {
        timeout: timeoutMillis
    });
    const rightNow = Date.now();
    for (const fasterAsset of fasterAssetsResponse.response.results) {
        const vinSerialIsValid = isValidVin(fasterAsset.vinSerial);
        createOrUpdateFasterAsset({
            assetNumber: fasterAsset.assetNumber,
            organization: fasterAsset.organization,
            vinSerial: fasterAsset.vinSerial,
            vinSerialIsValid: vinSerialIsValid ? 1 : 0,
            license: fasterAsset.license,
            year: fasterAsset.year,
            make: fasterAsset.make,
            model: fasterAsset.model,
            recordUpdate_timeMillis: rightNow
        }, database);
    }
    /*
     * Delete expired assets
     */
    const deleteCount = deleteExpiredRecords('FasterAssets', rightNow, database);
    if (deleteCount > 0) {
        debug(`Deleted ${deleteCount} expired assets.`);
    }
    database.close();
    /*
     * Trigger Tasks
     */
    if (process.send !== undefined) {
        if (getConfigProperty('modules.integrityChecker.nhtsaVehicles.isEnabled')) {
            debug('Triggering NHTSA Vehicles Task.');
            process.send({
                destinationTaskName: 'integrityChecker_nhtsaVehicles',
                timeMillis: rightNow
            });
        }
        if (
        // eslint-disable-next-line no-secrets/no-secrets
        getConfigProperty('modules.integrityChecker.worktechEquipment.isEnabled')) {
            debug('Triggering Worktech Equipment Task.');
            process.send({
                destinationTaskName: 'integrityChecker_worktechEquipment',
                timeMillis: rightNow
            });
        }
    }
}
const scheduledTask = new ScheduledTask(taskName, refreshFasterAssets, {
    schedule: {
        dayOfWeek: getConfigProperty('application.workDays'),
        hour: getConfigProperty('application.workHours'),
        minute: getScheduledTaskMinutes('integrityChecker_fasterAssets'),
        second: 0
    },
    lastRunMillis: getMaxFasterAssetUpdateMillis(),
    minimumIntervalMillis: getMinimumMillisBetweenRuns('integrityChecker_fasterAssets'),
    startTask: true
});
/*
 * Run the task on initialization
 */
void scheduledTask.runTask();
