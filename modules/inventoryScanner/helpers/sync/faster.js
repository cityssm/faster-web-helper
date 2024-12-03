// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-magic-numbers, unicorn/no-array-push-push */
import fs from 'node:fs/promises';
import path from 'node:path';
import { dateIntegerToDate } from '@cityssm/utils-datetime';
import { getConfigProperty } from '../../../../helpers/functions.config.js';
import { ensureTempFolderExists, tempFolderPath } from '../../../../helpers/functions.filesystem.js';
import { updateScannerRecordSyncFields } from '../../database/updateScannerRecordSyncFields.js';
function recordToExportDataLine(record) {
    // A - "RDC"
    const dataPieces = ['RDC'];
    // B - Ignored
    dataPieces.push('');
    // C - Storeroom
    dataPieces.push(record.itemStoreroom ?? '');
    // D - Technician ID
    dataPieces.push(record.technicianId ?? '');
    // E - Invoice Number
    dataPieces.push(record.recordId.toString().padStart(14, 'X'));
    // F - Invoice Date
    const scanDate = dateIntegerToDate(record.scanDate);
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
    dataPieces.push(record.itemNumber);
    // N - Description
    let itemDescription = (record.itemDescription ?? record.itemNumber).slice(0, 40);
    if (itemDescription.includes(',')) {
        itemDescription =
            '"' + itemDescription.replaceAll('"', String.raw `\"`) + '"';
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
    const timezone = (rightNow.getTimezoneOffset() / 60) * 100;
    const timezoneString = timezone > 0
        ? '-' + timezone.toString().padStart(4, '0')
        : '+' + Math.abs(timezone).toString().padStart(4, '0');
    const dateString = rightNow.getFullYear().toString() +
        '-' +
        (rightNow.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        rightNow.getDate().toString().padStart(2, '0') +
        '_' +
        rightNow.getHours().toString().padStart(2, '0') +
        rightNow.getMinutes().toString().padStart(2, '0') +
        rightNow.getSeconds().toString().padStart(2, '0') +
        timezoneString;
    const fileName = getConfigProperty('modules.inventoryScanner.exportFileNamePrefix') +
        dateString +
        '.csv';
    return fileName;
}
function updateMultipleScannerRecords(records, recordIdsToSkip, fields) {
    for (const record of records) {
        if (recordIdsToSkip.has(record.recordId)) {
            continue;
        }
        updateScannerRecordSyncFields({
            recordId: record.recordId,
            isSuccessful: fields.isSuccessful,
            syncedRecordId: fields.syncedRecordId,
            message: fields.message
        });
    }
}
export async function syncScannerRecordsWithFaster(records) {
    /*
     * Build file data
     */
    const exportFileDataLines = [];
    const errorRecordIds = new Set();
    for (const record of records) {
        try {
            exportFileDataLines.push(recordToExportDataLine(record));
        }
        catch (error) {
            errorRecordIds.add(record.recordId);
            updateScannerRecordSyncFields({
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
            isSuccessful: false,
            message: `Error writing file to temp folder: ${exportFilePath}`
        });
    }
    /*
     * Upload file
     */
    /*
     * Ping IIU
     */
}
