import { ScheduledTask } from '@cityssm/scheduled-task';
import { minutesToMillis } from '@cityssm/to-millis';
import schedule from 'node-schedule';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { getItemValidationRecordsByItemNumber } from '../database/getItemValidationRecords.js';
import getScannerRecords from '../database/getScannerRecords.js';
import getWorkOrderValidationRecords from '../database/getWorkOrderValidationRecords.js';
import { updateScannerRecordField } from '../database/updateScannerRecordField.js';
export const taskName = 'Update Records from Validation';
export const taskUserName = 'validationTask';
function updateRecordsFromValidation() {
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
                    updateScannerRecordField(record.recordId, 'repairId', workOrderValidationRecord.repairId, taskUserName);
                    break;
                }
            }
        }
        const itemValidationRecords = (record.itemStoreroom ?? '') === '' ||
            (record.itemDescription ?? '') === '' ||
            record.unitPrice === null
            ? getItemValidationRecordsByItemNumber(record.itemNumber, record.itemNumberPrefix)
            : [];
        if (itemValidationRecords.length > 0) {
            if ((record.itemStoreroom ?? '') === '') {
                updateScannerRecordField(record.recordId, 'itemStoreroom', itemValidationRecords[0].itemStoreroom, taskUserName);
            }
            if ((record.itemDescription ?? '') === '') {
                updateScannerRecordField(record.recordId, 'itemDescription', itemValidationRecords[0].itemDescription, taskUserName);
            }
            if (record.unitPrice === null) {
                updateScannerRecordField(record.recordId, 'unitPrice', itemValidationRecords[0].unitPrice, taskUserName);
            }
        }
    }
}
const scheduledTask = new ScheduledTask(taskName, updateRecordsFromValidation, {
    schedule: {
        dayOfWeek: getConfigProperty('application.workDays'),
        hour: getConfigProperty('application.workHours'),
        minute: new schedule.Range(0, 55, 5),
        second: 0
    },
    minimumIntervalMillis: minutesToMillis(2),
    startTask: true
});
/*
 * Listen for messages
 */
process.on('message', (_message) => {
    void scheduledTask.runTask();
});
/*
 * Run the task on initialization
 */
void scheduledTask.runTask();
