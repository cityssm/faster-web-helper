// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-magic-numbers, unicorn/prefer-single-call */
import fs from 'node:fs/promises';
import path from 'node:path';
import { itemName as itemNameConstants } from '@cityssm/faster-constants/inventory/items';
import { FasterUnofficialAPI, integrationNames } from '@cityssm/faster-unofficial-api';
import { dateIntegerToDate } from '@cityssm/utils-datetime';
import camelcase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../../debug.config.js';
import { getConfigProperty } from '../../../../helpers/config.helpers.js';
import { hasFasterApi, hasFasterUnofficialApi } from '../../../../helpers/fasterWeb.helpers.js';
import { ensureTempFolderExists, tempFolderPath } from '../../../../helpers/filesystem.helpers.js';
import { uploadFile } from '../../../../helpers/sftp.helpers.js';
import getWorkOrderValidationJsonData from '../../database-issue/getWorkOrderValidationJsonData.js';
import { updateScannerRecordSyncFields } from '../../database-issue/updateScannerRecordSyncFields.js';
import { moduleName } from '../module.helpers.js';
import { updateMultipleScannerRecords } from './syncHelpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelcase(moduleName)}:syncFaster`);
const fasterApiConfig = getConfigProperty('fasterWeb');
const exportFileNamePrefix = getConfigProperty('modules.inventoryScanner.fasterSync.exportFileNamePrefix');
const workOrderCache = new Map();
export function formatRecordIdAsInvoiceNumber(recordId) {
    return recordId.toString().padStart(14, 'X');
}
// eslint-disable-next-line complexity
async function recordToExportDataLine(record) {
    // A - "RDC"
    const dataPieces = ['RDC'];
    // B - Ignored
    dataPieces.push('');
    // C - Storeroom
    dataPieces.push(record.itemStoreroom ?? '');
    // D - Technician ID
    dataPieces.push(record.technicianId ??
        getConfigProperty('modules.inventoryScanner.fasterSync.defaultTechnicianId').toString());
    // E - Invoice Number
    dataPieces.push(formatRecordIdAsInvoiceNumber(record.recordId));
    /*
     * F - Invoice Date
     */
    let scanDate = dateIntegerToDate(record.scanDate);
    // Backdate the scan date to the repair date if available
    if (record.itemNumberPrefix !== '' && record.repairId !== null) {
        const workOrderValidationJson = getWorkOrderValidationJsonData(record.workOrderNumber, record.workOrderType, record.repairId);
        if (workOrderValidationJson !== undefined &&
            Object.keys(workOrderValidationJson).length > 0) {
            scanDate = new Date(workOrderValidationJson.createdDate);
        }
        if (hasFasterUnofficialApi) {
            const fasterApi = new FasterUnofficialAPI(fasterApiConfig.tenantOrBaseUrl, fasterApiConfig.appUserName ?? '', fasterApiConfig.appPassword ?? '');
            try {
                const workOrder = workOrderCache.has(record.workOrderNumber)
                    ? workOrderCache.get(record.workOrderNumber)
                    : await fasterApi.getWorkOrder(Number.parseInt(record.workOrderNumber, 10));
                if (workOrder !== undefined) {
                    workOrderCache.set(record.workOrderNumber, workOrder);
                    if (scanDate.getTime() < workOrder.dateTimeIn.getTime() ||
                        (workOrder.dateTimeOut !== undefined &&
                            scanDate.getTime() > workOrder.dateTimeOut.getTime())) {
                        scanDate = workOrder.dateTimeIn;
                    }
                }
            }
            catch {
                debug('Error communicating with FASTER Web.');
            }
        }
    }
    const fasterInvoiceDate = (scanDate.getMonth() + 1).toString().padStart(2, '0') +
        '/' +
        scanDate.getDate().toString().padStart(2, '0') +
        '/' +
        scanDate.getFullYear().toString().padStart(4, '0');
    dataPieces.push(fasterInvoiceDate);
    // G - Invoice Amount
    dataPieces.push(record.unitPrice === null
        ? ''
        : (record.quantity * record.unitPrice).toFixed(4));
    // H - Ignored
    dataPieces.push('');
    // I - Quantity
    dataPieces.push(record.quantity.toString());
    // J - Ignored
    dataPieces.push('');
    // K - Unit Price
    dataPieces.push(record.unitPrice === null ? '' : record.unitPrice.toFixed(4));
    // L - Line Abbreviation
    dataPieces.push('IIU');
    // M - Item Number
    const itemNumber = (record.itemNumberPrefix === '' ? '' : `${record.itemNumberPrefix}-`) +
        record.itemNumber;
    dataPieces.push(itemNumber);
    // N - Description
    let itemDescription = (record.itemDescription ?? itemNumber).slice(0, itemNameConstants.maxLength);
    if (itemDescription.includes(',')) {
        itemDescription =
            '"' +
                itemDescription
                    .replaceAll('"', "''")
                    .slice(0, itemNameConstants.maxLength) +
                '"';
    }
    dataPieces.push(itemDescription);
    // O - Ignored
    dataPieces.push('');
    // P - Ignored
    dataPieces.push('');
    // Q - Repair ID
    dataPieces.push(record.repairId === null ? '' : record.repairId.toString());
    // R - Work Order Number
    dataPieces.push(record.workOrderNumber);
    return dataPieces.join(',');
}
function getExportFileName() {
    const rightNow = new Date();
    /*
     * Date
     */
    const dateString = rightNow.getFullYear().toString() +
        '-' +
        (rightNow.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        rightNow.getDate().toString().padStart(2, '0');
    /*
     * Time
     */
    const timeString = rightNow.getHours().toString().padStart(2, '0') +
        rightNow.getMinutes().toString().padStart(2, '0') +
        rightNow.getSeconds().toString().padStart(2, '0');
    /*
     * Timezone
     */
    const timezone = (rightNow.getTimezoneOffset() / 60) * 100;
    const timezoneString = timezone > 0
        ? `-${timezone.toString().padStart(4, '0')}`
        : `+${Math.abs(timezone).toString().padStart(4, '0')}`;
    /*
     * Full date string
     */
    const fullDateString = `${dateString}_${timeString}${timezoneString}`;
    const fileName = exportFileNamePrefix + fullDateString + '.csv';
    return fileName;
}
export async function syncScannerRecordsWithFaster(records) {
    /*
     * Build file data
     */
    const exportFileDataLines = [];
    const errorRecordIds = new Set();
    for (const record of records) {
        try {
            exportFileDataLines.push(await recordToExportDataLine(record));
        }
        catch (error) {
            errorRecordIds.add(record.recordId);
            updateScannerRecordSyncFields({
                workOrderType: 'faster',
                recordId: record.recordId,
                isSuccessful: false,
                message: error.message
            });
        }
    }
    const exportFileData = exportFileDataLines.join('\n');
    /*
     * Write file
     */
    const exportFileName = getExportFileName();
    await ensureTempFolderExists();
    const exportFilePath = path.join(tempFolderPath, exportFileName);
    try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(exportFilePath, exportFileData);
    }
    catch {
        updateMultipleScannerRecords(records, errorRecordIds, {
            workOrderType: 'faster',
            isSuccessful: false,
            message: `Error writing file to temp folder: ${exportFilePath}`
        });
        return;
    }
    /*
     * Upload file
     */
    const targetFtpPath = getConfigProperty('modules.inventoryScanner.fasterSync.ftpPath');
    try {
        await uploadFile(targetFtpPath, exportFilePath);
    }
    catch {
        updateMultipleScannerRecords(records, errorRecordIds, {
            workOrderType: 'faster',
            isSuccessful: false,
            message: `Error uploading file to FTP path: ${targetFtpPath}`
        });
        return;
    }
    /*
     * Ping IIU
     */
    const integrationId = getConfigProperty('modules.inventoryScanner.fasterSync.integrationId');
    if (hasFasterApi && integrationId !== undefined) {
        const fasterApiImport = await import('@cityssm/faster-api');
        const fasterApi = new fasterApiImport.FasterApi(fasterApiConfig.tenantOrBaseUrl, fasterApiConfig.apiUserName ?? '', fasterApiConfig.apiPassword ?? '');
        try {
            await fasterApi.createIntegrationLogMessage({
                integrationId,
                integrationLogLevel: 'Information',
                integrationLogMessageType: 'Summary',
                message: 'File uploaded to FTP.',
                transactionData: JSON.stringify({
                    ftpHost: getConfigProperty('ftp')?.host,
                    folderPath: targetFtpPath,
                    fileName: exportFileName,
                    recordCount: exportFileDataLines.length
                }, undefined, 2)
            });
        }
        catch {
            debug('Error communicating with FASTER Web API.');
        }
    }
    if (hasFasterUnofficialApi) {
        const fasterApi = new FasterUnofficialAPI(fasterApiConfig.tenantOrBaseUrl, fasterApiConfig.appUserName ?? '', fasterApiConfig.appPassword ?? '');
        try {
            await fasterApi.executeIntegration(integrationNames.inventoryImportUtility);
        }
        catch {
            debug('Error communicating with FASTER Web.');
        }
    }
    updateMultipleScannerRecords(records, errorRecordIds, {
        workOrderType: 'faster',
        isSuccessful: true,
        message: 'File successfully uploaded to FTP.',
        syncedRecordId: exportFileName
    });
}
