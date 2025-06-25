import camelcase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../../debug.config.js';
import getScannerRecords from '../../database-issue/getScannerRecords.js';
import getSetting from '../../database/getSetting.js';
import updateSetting from '../../database/updateSetting.js';
import { moduleName } from '../../helpers/module.helpers.js';
import { syncScannerRecordsWithFaster } from '../../helpers/sync/fasterWeb.syncHelpers.js';
import { syncScannerRecordsWithWorktech } from '../../helpers/sync/worktech.syncHelpers.js';
import { sortScannerRecordsByWorkOrderType } from '../../helpers/workOrders.helpers.js';
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
                process.send?.({
                    // eslint-disable-next-line no-secrets/no-secrets
                    destinationTaskName: 'inventoryScanner_downloadFasterMessageLog',
                    timeMillis: Date.now()
                });
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
/*
 * Run the task if not already running.
 */
const isRunningSettingName = 'syncScannerRecords.isRunning';
const isRunning = getSetting(isRunningSettingName) ?? '0';
if (isRunning === '1') {
    debug(`"${taskName}" is already running, skipping...`);
}
else {
    try {
        // Mark the task as running
        updateSetting(isRunningSettingName, '1');
        await syncScannerRecordsTask();
    }
    finally {
        // Mark the task as not running
        updateSetting(isRunningSettingName, '0');
        debug(`"${taskName}" completed.`);
    }
}
