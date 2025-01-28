import { FasterApi } from '@cityssm/faster-api';
import { minutesToMillis } from '@cityssm/to-millis';
import { Sema } from 'async-sema';
import camelcase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import schedule from 'node-schedule';
import { DEBUG_NAMESPACE } from '../../../../debug.config.js';
import { getConfigProperty } from '../../../../helpers/config.helpers.js';
import { getScheduledTaskMinutes } from '../../../../helpers/tasks.helpers.js';
import createOrUpdateWorkOrderValidation from '../../database/createOrUpdateWorkOrderValidation.js';
import deleteWorkOrderValidation from '../../database/deleteWorkOrderValidation.js';
import getMaxWorkOrderValidationRecordUpdateMillis from '../../database/getMaxWorkOrderValidationRecordUpdateMillis.js';
import { getRepairIdsToRefresh } from '../../helpers/faster.helpers.js';
import { moduleName } from '../../helpers/module.helpers.js';
const minimumMillisBetweenRuns = minutesToMillis(20);
let lastRunMillis = getMaxWorkOrderValidationRecordUpdateMillis('faster');
const semaphore = new Sema(1);
export const taskName = 'Work Order Validation Task - FASTER API';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`);
const fasterWebConfig = getConfigProperty('fasterWeb');
async function _updateWorkOrderValidationFromFasterApi() {
    if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
        debug('Skipping run.');
        return;
    }
    if (fasterWebConfig.apiUserName === undefined ||
        fasterWebConfig.apiPassword === undefined) {
        debug('Missing API user configuration.');
        return;
    }
    debug(`Running "${taskName}"...`);
    const timeMillis = Date.now();
    const fasterApi = new FasterApi(fasterWebConfig.tenantOrBaseUrl, fasterWebConfig.apiUserName, fasterWebConfig.apiPassword);
    const repairIdsToRefresh = getRepairIdsToRefresh();
    debug(`Querying ${repairIdsToRefresh.length} repairs from the FASTER API...`);
    try {
        const repairResponse = await fasterApi.getRepairs(repairIdsToRefresh);
        if (!repairResponse.success) {
            debug(`FASTER API error: ${JSON.stringify(repairResponse.error)}`);
            return;
        }
        for (const repair of repairResponse.response.results) {
            if (repair.documentID === 0) {
                deleteWorkOrderValidation(repair.repairID, 'faster');
            }
            else {
                createOrUpdateWorkOrderValidation({
                    workOrderNumber: repair.documentID.toString(),
                    workOrderType: 'faster',
                    workOrderDescription: repair.groupComponentAction,
                    repairId: repair.repairID,
                    repairDescription: repair.repairDesc,
                    technicianId: undefined,
                    technicianDescription: repair.technicianName
                }, timeMillis);
            }
        }
    }
    catch (error) {
        debug(`FASTER API error: ${error}`);
    }
    lastRunMillis = timeMillis;
    debug(`Finished "${taskName}".`);
}
async function updateWorkOrderValidationFromFasterApi() {
    await semaphore.acquire();
    try {
        await _updateWorkOrderValidationFromFasterApi();
    }
    catch (error) {
        debug('Error:', error);
    }
    finally {
        semaphore.release();
    }
}
/*
 * Run task on initialization
 */
await updateWorkOrderValidationFromFasterApi();
/*
 * Schedule task
 */
const job = schedule.scheduleJob(taskName, {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('inventoryScanner.workOrderValidation.fasterApi'),
    second: 0
}, updateWorkOrderValidationFromFasterApi);
/*
 * Graceful shutdown
 */
exitHook(() => {
    try {
        job.cancel();
    }
    catch {
        // ignore
    }
});
/*
 * Listen for messages
 */
process.on('message', (_message) => {
    void updateWorkOrderValidationFromFasterApi();
});
