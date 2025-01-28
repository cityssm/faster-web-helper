// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
import { minutesToMillis } from '@cityssm/to-millis';
import { WorkTechAPI } from '@cityssm/worktech-api';
import { Sema } from 'async-sema';
import camelcase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import schedule from 'node-schedule';
import { DEBUG_NAMESPACE } from '../../../../debug.config.js';
import { getConfigProperty } from '../../../../helpers/config.helpers.js';
import { getScheduledTaskMinutes } from '../../../../helpers/tasks.helpers.js';
import createOrUpdateWorkOrderValidation from '../../database/createOrUpdateWorkOrderValidation.js';
import getMaxWorkOrderValidationRecordUpdateMillis from '../../database/getMaxWorkOrderValidationRecordUpdateMillis.js';
import getScannerRecords from '../../database/getScannerRecords.js';
import { moduleName } from '../../helpers/module.helpers.js';
const minimumMillisBetweenRuns = minutesToMillis(20);
let lastRunMillis = getMaxWorkOrderValidationRecordUpdateMillis('worktech');
const semaphore = new Sema(1);
export const taskName = 'Work Order Validation Task - Worktech';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`);
const worktechConfig = getConfigProperty('worktech');
async function _updateWorkOrderValidationFromWorktech() {
    if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
        debug('Skipping run.');
        return;
    }
    if (worktechConfig === undefined) {
        debug('Missing Worktech configuration.');
        return;
    }
    debug(`Running "${taskName}"...`);
    const timeMillis = Date.now();
    const worktech = new WorkTechAPI(worktechConfig);
    const scannerRecords = getScannerRecords({
        isSynced: false,
        workOrderType: 'worktech'
    });
    for (const scannerRecord of scannerRecords) {
        const workOrder = await worktech.getWorkOrderByWorkOrderNumber(scannerRecord.workOrderNumber);
        if (workOrder !== undefined) {
            createOrUpdateWorkOrderValidation({
                workOrderNumber: workOrder.workOrderNumber,
                workOrderType: 'worktech',
                workOrderDescription: workOrder.details,
                repairId: null,
                repairDescription: null,
                technicianDescription: workOrder.assignedTo
            }, timeMillis);
        }
    }
    lastRunMillis = timeMillis;
    debug(`Finished "${taskName}".`);
}
async function updateWorkOrderValidationFromWorktech() {
    await semaphore.acquire();
    try {
        await _updateWorkOrderValidationFromWorktech();
    }
    catch (error) {
        debug('Error:', error);
    }
    finally {
        semaphore.release();
    }
}
await updateWorkOrderValidationFromWorktech();
const job = schedule.scheduleJob(taskName, {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('inventoryScanner.workOrderValidation.worktech'),
    second: 0
}, updateWorkOrderValidationFromWorktech);
exitHook(() => {
    try {
        job.cancel();
    }
    catch {
        // ignore
    }
});
process.on('message', (_message) => {
    void updateWorkOrderValidationFromWorktech();
});
