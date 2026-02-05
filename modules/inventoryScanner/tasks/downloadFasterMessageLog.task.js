import { extractInventoryImportErrors } from '@cityssm/faster-report-parser/advanced';
import { FasterUnofficialAPI } from '@cityssm/faster-unofficial-api';
import { ScheduledTask } from '@cityssm/scheduled-task';
import sqlite from 'better-sqlite3';
import camelcase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../debug.config.js';
import { getConfigProperty } from '../../../helpers/config.helpers.js';
import { hasFasterUnofficialApi } from '../../../helpers/fasterWeb.helpers.js';
import createSyncErrorLogRecord from '../database-issue/createSyncErrorLogRecord.js';
import getLatestSyncErrorLog from '../database-issue/getLatestSyncErrorLog.js';
import getScannerRecords from '../database-issue/getScannerRecords.js';
import { updateScannerRecordSyncFields } from '../database-issue/updateScannerRecordSyncFields.js';
import { databasePath } from '../helpers/database.helpers.js';
import { moduleName } from '../helpers/module.helpers.js';
export const taskName = 'Download FASTER Message Log';
export const taskUser = 'faster.w603';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`);
const fasterWebConfig = getConfigProperty('fasterWeb');
async function downloadFasterMessageLog() {
    if (!hasFasterUnofficialApi) {
        debug('Missing user configuration.');
        return;
    }
    /*
     * Get the message log errors from the past seven days
     */
    const fasterApi = new FasterUnofficialAPI(fasterWebConfig.tenantOrBaseUrl, fasterWebConfig.appUserName ?? '', fasterWebConfig.appPassword ?? '');
    const today = new Date();
    const windowDate = new Date();
    windowDate.setMonth(windowDate.getMonth() - 4);
    const messageLogErrors = await fasterApi.getMessageLog(windowDate, today);
    if (messageLogErrors.length === 0) {
        debug('No message log errors in the past four months.');
        return;
    }
    const iiuErrors = extractInventoryImportErrors(messageLogErrors);
    if (iiuErrors.length === 0) {
        debug('No IIU log errors identified in the past four months.');
        return;
    }
    /*
     * Get the last recorded log id
     */
    const database = sqlite(databasePath);
    const latestLogEntry = getLatestSyncErrorLog('faster', database);
    const lastRecordedLogId = latestLogEntry === undefined ? 0 : Number.parseInt(latestLogEntry.logId, 10);
    /*
     * Loop through the message log errors
     */
    let errorsRecords = 0;
    const scannerRecordsCache = new Map();
    for (const iiuError of iiuErrors) {
        if (iiuError.messageId <= lastRecordedLogId ||
            !iiuError.message.startsWith('Error: ')) {
            continue;
        }
        else if (iiuError.fileName === undefined) {
            createSyncErrorLogRecord({
                workOrderType: 'faster',
                logId: iiuError.messageId.toString(),
                logDate: new Date(iiuError.messageDateTime),
                logMessage: iiuError.message,
                recordCreate_userName: taskUser
            });
            errorsRecords += 1;
        }
        else {
            /*
             * Get the scanner records
             */
            let scannerRecords = scannerRecordsCache.get(iiuError.fileName);
            if (scannerRecords === undefined) {
                scannerRecords = getScannerRecords({
                    isSynced: true,
                    isSyncedSuccessfully: true,
                    syncedRecordId: iiuError.fileName
                }, {}, database);
                scannerRecordsCache.set(iiuError.fileName, scannerRecords);
            }
            /*
             * Attempt to find a matching scanner record
             */
            const matchingScannerRecord = scannerRecords.find((possibleMatch) => {
                const itemNumber = (possibleMatch.itemNumberPrefix === ''
                    ? ''
                    : `${possibleMatch.itemNumberPrefix}-`) + possibleMatch.itemNumber;
                return (
                // Invoice Number - Left padded with Xs
                iiuError.message.includes(`${possibleMatch.recordId},`) &&
                    iiuError.message.includes(`,${possibleMatch.quantity},`) &&
                    iiuError.message.includes(`,${itemNumber},`) &&
                    // Repair ID - Includes a space ahead of it
                    iiuError.message.includes(`${possibleMatch.repairId},`) &&
                    // Work Order Number - Last item, no following comma
                    iiuError.message.includes(`,${possibleMatch.workOrderNumber}`));
            });
            try {
                createSyncErrorLogRecord({
                    workOrderType: 'faster',
                    logId: iiuError.messageId.toString(),
                    logDate: new Date(iiuError.messageDateTime),
                    logMessage: iiuError.message,
                    scannerSyncedRecordId: iiuError.fileName,
                    scannerRecordId: matchingScannerRecord?.recordId,
                    recordCreate_userName: taskUser
                });
            }
            catch {
                debug(`Failed to create sync error log record for message ID ${iiuError.messageId}.`);
            }
            errorsRecords += 1;
            if (matchingScannerRecord !== undefined) {
                updateScannerRecordSyncFields({
                    workOrderType: 'faster',
                    recordId: matchingScannerRecord.recordId,
                    isSuccessful: false,
                    syncedRecordId: matchingScannerRecord.recordSync_syncedRecordId ??
                        iiuError.fileName,
                    message: iiuError.message
                }, database);
            }
        }
    }
    database.close();
    debug(`Recorded ${errorsRecords} IIU log errors.`);
}
const scheduledTask = new ScheduledTask(taskName, downloadFasterMessageLog, {
    schedule: {
        dayOfWeek: getConfigProperty('application.workDays'),
        hour: getConfigProperty('application.workHours').at(-1),
        minute: 59,
        second: 59
    },
    startTask: true
});
await scheduledTask.runTask();
/*
 * Listen for messages
 */
process.on('message', (_message) => {
    void scheduledTask.runTask();
});
