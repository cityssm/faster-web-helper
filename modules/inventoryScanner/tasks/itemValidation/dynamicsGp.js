import { DynamicsGP } from '@cityssm/dynamics-gp';
import camelCase from 'camelcase';
import Debug from 'debug';
import { getConfigProperty } from '../../../../helpers/functions.config.js';
import createOrUpdateItemValidation from '../../database/createOrUpdateItemValidation.js';
import deleteItemValidation from '../../database/deleteItemValidation.js';
import { moduleName } from '../../helpers/module.js';
export const taskName = 'Inventory Validation Task - Dynamics GP';
const debug = Debug(`faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`);
const itemNumberRegex = getConfigProperty('modules.inventoryScanner.items.itemNumberRegex');
const taskConfig = getConfigProperty('modules.inventoryScanner.items.validation');
const dynamicsGpDatabaseConfig = getConfigProperty('dynamicsGP');
export async function runUpdateItemValidationFromDynamicsGpTask() {
    if (dynamicsGpDatabaseConfig === undefined) {
        debug('Missing configuration.');
        return;
    }
    debug(`Running "${taskName}"...`);
    const gpDatabase = new DynamicsGP(dynamicsGpDatabaseConfig);
    const items = await gpDatabase.getItemsByLocationCodes(Object.keys(taskConfig.gpLocationCodesToFasterStorerooms));
    if (items.length > 0) {
        debug(`Syncing ${items.length} inventory items...`);
        const timeMillis = Date.now();
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
                itemNumber: item.itemNumber,
                itemDescription: item.itemDescription,
                availableQuantity: item.quantityOnHand,
                unitPrice: item.currentCost
            }, timeMillis);
        }
        deleteItemValidation(timeMillis);
    }
    debug(`Finished "${taskName}".`);
}
export default {
    taskName,
    schedule: taskConfig.schedule ?? {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        dayOfWeek: [1, 2, 3, 4, 5],
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        hour: [4, 6, 8, 10, 12, 14, 16, 18, 20],
        minute: 15,
        second: 0
    },
    task: runUpdateItemValidationFromDynamicsGpTask
};