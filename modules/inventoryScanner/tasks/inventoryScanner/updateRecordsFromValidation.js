import { minutesToMillis } from '@cityssm/to-millis';
import camelcase from 'camelcase';
import Debug from 'debug';
import exitHook from 'exit-hook';
import schedule from 'node-schedule';
import { getItemValidationRecordsByItemNumber } from '../../database/getItemValidationRecords.js';
import getScannerRecords from '../../database/getScannerRecords.js';
import getWorkOrderValidationRecords from '../../database/getWorkOrderValidationRecords.js';
import { updateScannerRecord } from '../../database/updateScannerRecord.js';
import { moduleName } from '../../helpers/module.js';
const minimumMillisBetweenRuns = minutesToMillis(2);
const lastRunMillis = 0;
export const taskName = 'Update Records from Validation Task';
export const taskUserName = 'validationTask';
const debug = Debug(`faster-web-helper:${camelcase(moduleName)}:${camelcase(taskName)}`);
function updateRecordsFromValidationTask() {
    if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
        debug('Skipping run.');
        return;
    }
    debug(`Running "${taskName}"...`);
    const unvalidatedRecords = getScannerRecords({
        isSynced: false,
        hasMissingValidation: true
    });
    for (const record of unvalidatedRecords) {
        const workOrderValidationRecords = record.repairId === null || record.repairDescription === null
            ? getWorkOrderValidationRecords(record.workOrderNumber, record.workOrderType)
            : [];
        if (workOrderValidationRecords.length > 0 && record.repairId === null) {
            for (const workOrderValidationRecord of workOrderValidationRecords) {
                if (workOrderValidationRecord.repairId !== null) {
                    updateScannerRecord(record.recordId, 'repairId', workOrderValidationRecord.repairId, taskUserName);
                    break;
                }
            }
        }
        const itemValidationRecords = record.itemStoreroom === null || record.unitPrice === null
            ? getItemValidationRecordsByItemNumber(record.itemNumber)
            : [];
        if (itemValidationRecords.length > 0) {
            if (record.itemStoreroom === null) {
                updateScannerRecord(record.recordId, 'itemStoreroom', itemValidationRecords[0].itemStoreroom, taskUserName);
            }
            if (record.unitPrice === null) {
                updateScannerRecord(record.recordId, 'unitPrice', itemValidationRecords[0].unitPrice, taskUserName);
            }
        }
    }
    debug(`Finished "${taskName}".`);
}
updateRecordsFromValidationTask();
const job = schedule.scheduleJob(taskName, {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    dayOfWeek: new schedule.Range(1, 5),
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    hour: new schedule.Range(4, 20),
    minute: new schedule.Range(0, 55, 5),
    second: 0
}, updateRecordsFromValidationTask);
exitHook(() => {
    try {
        job.cancel();
    }
    catch {
        // ignore
    }
});
