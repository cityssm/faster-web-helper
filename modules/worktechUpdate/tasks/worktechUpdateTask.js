import fs from 'node:fs/promises';
import { parseW217ExcelReport } from '@cityssm/faster-api/xlsxReports.js';
import { dateStringToInteger, timeStringToInteger } from '@cityssm/utils-datetime';
import { WorkTechAPI } from '@cityssm/worktech-api';
import Debug from 'debug';
import schedule from 'node-schedule';
import { getConfigProperty } from '../../../helpers/functions.config.js';
import { downloadFilesToTemp } from '../../../helpers/functions.sftp.js';
import addReturnToVendorRecord from '../database/local/addReturnToVendorRecord.js';
import addWorkOrderNumberMapping from '../database/local/addWorkOrderNumberMapping.js';
import getReturnToVendorRecord from '../database/local/getReturnToVendorRecord.js';
import getWorkOrderNumberMapping from '../database/local/getWorkOrderNumberMapping.js';
import updateWorkOrderNumberMapping from '../database/local/updateWorkOrderNumberMapping.js';
const debug = Debug('faster-web-helper:worktechUpdate:task');
let worktech;
const directChargeTransactionsConfig = getConfigProperty('modules.worktechUpdate.reports.w217');
async function _w217UpdateWorkOrderNumberMappings(report, data) {
    const mapping = getWorkOrderNumberMapping(data.documentNumber);
    const exportDate = dateStringToInteger(report.exportDate);
    const exportTime = timeStringToInteger(report.exportTime);
    if (mapping === undefined) {
        /*
         * Unseen Mapping
         * Save it
         */
        debug(`New Mapping: ${data.documentNumber} -> ${data.symptom}`);
        addWorkOrderNumberMapping({
            documentNumber: data.documentNumber,
            workOrderNumber: data.symptom,
            exportDate,
            exportTime
        });
    }
    else if (mapping.exportDate < exportDate ||
        (mapping.exportDate === exportDate && mapping.exportTime < exportTime)) {
        /*
         * This record is newer.
         */
        if (mapping.workOrderNumber !== data.symptom) {
            /*
             * Work order number change.
             * Update any previous records for the document number.
             */
            debug(`Work Order Number Update: ${data.documentNumber} -> ${data.symptom}`);
            const oldResourceRecords = await worktech.getWorkOrderResourcesByWorkOrderNumber(mapping.workOrderNumber);
            if (data.symptom === '') {
                for (const oldResourceRecord of oldResourceRecords) {
                    await worktech.deleteWorkOrderResource(oldResourceRecord.serviceRequestItemSystemId);
                }
            }
            else {
                const newWorkOrder = await worktech.getWorkOrderByWorkOrderNumber(data.symptom);
                if (newWorkOrder === undefined) {
                    debug(`New work order number not found: ${data.symptom}`);
                    return false;
                }
                for (const oldResourceRecord of oldResourceRecords) {
                    await worktech.updateWorkOrderResource({
                        serviceRequestItemSystemId: oldResourceRecord.serviceRequestItemSystemId,
                        serviceRequestSystemId: newWorkOrder?.serviceRequestSystemId,
                        workOrderNumber: newWorkOrder?.workOrderNumber
                    });
                }
            }
        }
        /*
         * Update mapping record
         */
        updateWorkOrderNumberMapping({
            documentNumber: mapping.documentNumber,
            workOrderNumber: data.symptom,
            exportDate,
            exportTime
        });
    }
    return true;
}
function _w217TrackReturnToVendorRecords(report, data) {
    for (const transaction of data.transactions) {
        if (transaction.repairDescription.startsWith('Return to Vendor - ')) {
            const transactionRecord = {
                documentNumber: data.documentNumber,
                storeroom: transaction.storeroom,
                itemNumber: transaction.itemNumber,
                transactionDate: dateStringToInteger(transaction.transactionDate),
                quantity: transaction.quantity,
                cost: transaction.cost
            };
            const existingRecord = getReturnToVendorRecord(transactionRecord);
            if (existingRecord === undefined) {
                debug(`New "Return to Vendor" record: ${JSON.stringify(transactionRecord)}`);
                addReturnToVendorRecord(transactionRecord);
            }
        }
    }
}
/**
 * - Maintains mappings between Faster document nubmers and Worktech work order numbers.
 * - Tracks "Return to Vendor" transactions.
 */
async function downloadAndUpdateDirectChargeHelperData() {
    /*
     * Download files to temp
     */
    const tempDirectChargeReportFiles = await downloadFilesToTemp(directChargeTransactionsConfig.ftpPath);
    /*
     * Loop through files
     */
    for (const reportFile of tempDirectChargeReportFiles) {
        try {
            const report = parseW217ExcelReport(reportFile);
            for (const data of report.data) {
                await _w217UpdateWorkOrderNumberMappings(report, data);
                _w217TrackReturnToVendorRecords(report, data);
            }
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            await fs.unlink(reportFile);
        }
        catch (error) {
            debug(error);
        }
    }
}
export async function inititalizeWorktechUpdateTask() {
    debug('Initializing task');
    worktech = new WorkTechAPI(getConfigProperty('worktech'));
    await downloadAndUpdateDirectChargeHelperData();
    schedule.scheduleJob('downloadAndUpdateDirectChargeHelperData()', directChargeTransactionsConfig.schedule, downloadAndUpdateDirectChargeHelperData);
}
