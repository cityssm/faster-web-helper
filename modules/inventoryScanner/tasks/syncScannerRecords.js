import camelcase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../debug.config.js';
import getScannerRecords from '../database/getScannerRecords.js';
import { moduleName } from '../helpers/module.helpers.js';
import { syncScannerRecordsWithFaster } from '../helpers/sync/fasterWeb.syncHelpers.js';
import { syncScannerRecordsWithWorktech } from '../helpers/sync/worktech.syncHelpers.js';
import { sortScannerRecordsByWorkOrderType } from '../helpers/workOrders.helpers.js';
export const taskName = 'Sync Scanner Records';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`);
async function syncScannerRecordsTask() {
    debug(`Running "${taskName}"...`);
    const recordsToSyncList = getScannerRecords({
        isMarkedForSync: true
    });
    const recordsToSync = sortScannerRecordsByWorkOrderType(recordsToSyncList);
    for (const [workOrderType, records] of Object.entries(recordsToSync)) {
        switch (workOrderType) {
            case 'faster': {
                await syncScannerRecordsWithFaster(records);
                break;
            }
            case 'worktech': {
                await syncScannerRecordsWithWorktech(records);
                break;
            }
        }
    }
    debug(`Finished "${taskName}", synced ${recordsToSyncList.length} record(s).`);
}
await syncScannerRecordsTask();
