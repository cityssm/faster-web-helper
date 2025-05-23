import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime';
import { WorkTechAPI } from '@cityssm/worktech-api';
import camelcase from 'camelcase';
import Debug from 'debug';
import { DEBUG_NAMESPACE } from '../../../../debug.config.js';
import { getConfigProperty } from '../../../../helpers/config.helpers.js';
import { moduleName } from '../module.helpers.js';
import { updateMultipleScannerRecords } from './syncHelpers.js';
const debug = Debug(`${DEBUG_NAMESPACE}:${camelcase(moduleName)}:syncWorktech`);
const worktechConfig = getConfigProperty('worktech');
export async function syncScannerRecordsWithWorktech(records) {
    if (worktechConfig === undefined) {
        debug('Missing Worktech configuration.');
        return;
    }
    const currentDate = new Date();
    const currentDateString = dateToString(currentDate);
    const currentTimeString = dateToTimePeriodString(currentDate);
    const batch = {
        batchDate: currentDateString,
        batchDescription: `${currentDateString} ${currentTimeString} - Inventory Scanner - FASTER Web Helper`,
        entries: []
    };
    for (const record of records) {
        batch.entries.push({
            entryDate: record.scanDateString,
            workOrderNumber: record.workOrderNumber,
            itemNumber: record.itemNumber,
            quantity: record.quantity
        });
    }
    if (batch.entries.length > 0) {
        const worktech = new WorkTechAPI(worktechConfig);
        try {
            const batchId = await worktech.createStockTransactionBatch(batch);
            updateMultipleScannerRecords(records, new Set(), {
                isSuccessful: true,
                message: 'Stock transactions batch created successfully.',
                syncedRecordId: batchId.toString()
            });
        }
        catch {
            updateMultipleScannerRecords(records, new Set(), {
                isSuccessful: false,
                message: 'Error creating stock transactions batch.'
            });
        }
    }
}
