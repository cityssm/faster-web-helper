import { DynamicsGP } from '@cityssm/dynamics-gp';
import camelCase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import schedule from 'node-schedule';
import { DEBUG_NAMESPACE } from '../../../../debug.config.js';
import { getConfigProperty } from '../../../../helpers/config.helpers.js';
import { getMinimumMillisBetweenRuns, getScheduledTaskMinutes } from '../../../../helpers/tasks.helpers.js';
import createOrUpdateItemValidation from '../../database/createOrUpdateItemValidation.js';
import deleteExpiredItemValidationRecords from '../../database/deleteExpiredItemValidationRecords.js';
import getMaxItemValidationRecordUpdateMillis from '../../database/getMaxItemValidationRecordUpdateMillis.js';
import { moduleName } from '../../helpers/module.helpers.js';
const minimumMillisBetweenRuns = getMinimumMillisBetweenRuns('inventoryScanner.itemValidation.dynamicsGp');
let lastRunMillis = getMaxItemValidationRecordUpdateMillis('');
export const taskName = 'Inventory Validation Task - Dynamics GP';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`);
const itemNumberRegex = getConfigProperty('modules.inventoryScanner.items.itemNumberRegex');
const taskConfig = getConfigProperty('modules.inventoryScanner.items.validation');
const dynamicsGpDatabaseConfig = getConfigProperty('dynamicsGP');
async function runUpdateItemValidationFromDynamicsGpTask() {
    if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
        debug('Skipping run.');
        return;
    }
    if (dynamicsGpDatabaseConfig === undefined) {
        debug('Missing configuration.');
        return;
    }
    debug(`Running "${taskName}"...`);
    const timeMillis = Date.now();
    lastRunMillis = timeMillis;
    const gpDatabase = new DynamicsGP(dynamicsGpDatabaseConfig);
    const items = await gpDatabase.getItemsByLocationCodes(Object.keys(taskConfig.gpLocationCodesToFasterStorerooms));
    if (items.length > 0) {
        debug(`Syncing ${items.length} inventory items...`);
        for (const item of items) {
            // Skip records with invalid item numbers
            if (itemNumberRegex !== undefined &&
                !itemNumberRegex.test(item.itemNumber)) {
                continue;
            }
            // Skip records filtered for other reasons
            if (taskConfig.gpItemFilter !== undefined &&
                !taskConfig.gpItemFilter(item)) {
                continue;
            }
            const itemStoreroom = taskConfig.gpLocationCodesToFasterStorerooms[item.locationCode] ?? '';
            createOrUpdateItemValidation({
                itemStoreroom,
                itemNumberPrefix: '',
                itemNumber: item.itemNumber,
                itemDescription: item.itemDescription,
                availableQuantity: item.quantityOnHand,
                unitPrice: item.currentCost
            }, timeMillis);
        }
        deleteExpiredItemValidationRecords(timeMillis);
    }
    debug(`Finished "${taskName}".`);
}
await runUpdateItemValidationFromDynamicsGpTask();
const job = schedule.scheduleJob(taskName, {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('inventoryScanner.itemValidation.dynamicsGp'),
    second: 0
}, runUpdateItemValidationFromDynamicsGpTask);
exitHook(() => {
    try {
        job.cancel();
    }
    catch {
        // ignore
    }
});
