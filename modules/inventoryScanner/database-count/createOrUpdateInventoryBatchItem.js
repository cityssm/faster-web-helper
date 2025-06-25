import { dateToInteger, dateToTimeInteger } from '@cityssm/utils-datetime';
import sqlite from 'better-sqlite3';
import { getItemValidationRecordsByItemNumber } from '../database-issue/getItemValidationRecords.js';
import { databasePath } from '../helpers/database.helpers.js';
import { getOpenedInventoryBatch } from './getInventoryBatch.js';
// eslint-disable-next-line complexity
export default function createOrUpdateInventoryBatchItem(form, user) {
    /*
     * Ensure the batch is open
     */
    const openBatch = getOpenedInventoryBatch(false, false, user);
    if (openBatch === undefined) {
        return {
            success: false,
            batchIsOpen: false,
            message: 'No open inventory batch found.'
        };
    }
    /*
     * Ensure the batch ID matches the open batch
     */
    const batchId = typeof form.batchId === 'string'
        ? Number.parseInt(form.batchId)
        : form.batchId;
    if (openBatch.batchId !== batchId) {
        return {
            success: false,
            batchIsOpen: false,
            message: 'The batch does not match the open batch.'
        };
    }
    /*
     * Get the item storeroom from the item validation records
     */
    const database = sqlite(databasePath);
    let itemStoreroom = form.itemStoreroom ?? '';
    if (itemStoreroom === '') {
        const possibleItems = getItemValidationRecordsByItemNumber(form.itemNumber, '', database);
        if (possibleItems.length > 0) {
            itemStoreroom = possibleItems[0].itemStoreroom;
        }
    }
    /*
     * Record the item in the batch
     */
    const rightNow = new Date();
    let message = 'Counted quantity recorded successfully.';
    if (form.countedQuantity === '') {
        // Delete the existing record
        database
            .prepare(`update InventoryBatchItems
          set recordDelete_userName = ?,
          recordDelete_timeMillis = ?
          where batchId = ?
          and itemStoreroom = ?
          and itemNumber = ?
          and recordDelete_timeMillis is null`)
            .run(user?.userName ?? `scanner.${form.scannerKey ?? ''}`, rightNow.getTime(), batchId, itemStoreroom, form.itemNumber);
        message = 'Counted quantity removed successfully.';
    }
    else {
        const result = database
            .prepare(`insert or ignore into InventoryBatchItems (
          batchId, itemStoreroom, itemNumber, countedQuantity,
          scannerKey, scanDate, scanTime,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?,
            ?, ?, ?,
            ?, ?, ?, ?)`)
            .run(batchId, itemStoreroom, form.itemNumber, form.countedQuantity, form.scannerKey ?? '', dateToInteger(rightNow), dateToTimeInteger(rightNow), user?.userName ?? `scanner.${form.scannerKey ?? ''}`, rightNow.getTime(), user?.userName ?? `scanner.${form.scannerKey ?? ''}`, rightNow.getTime());
        if (result.changes === 0) {
            // Update the existing record
            database
                .prepare(`update InventoryBatchItems
            set countedQuantity = ?,
              scannerKey = ?,
              scanDate = ?,
              scanTime = ?,
              recordDelete_userName = null,
              recordDelete_timeMillis = null,
              recordUpdate_userName = ?,
              recordUpdate_timeMillis = ?
            where batchId = ?
              and itemStoreroom = ?
              and itemNumber = ?`)
                .run(form.countedQuantity, form.scannerKey ?? '', dateToInteger(rightNow), dateToTimeInteger(rightNow), user?.userName ?? `scanner.${form.scannerKey ?? ''}`, rightNow.getTime(), batchId, itemStoreroom, form.itemNumber);
            message = 'Counted quantity updated successfully.';
        }
    }
    database.close();
    return {
        success: true,
        batchIsOpen: true,
        message
    };
}
