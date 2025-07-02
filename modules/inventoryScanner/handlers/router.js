import { Router } from 'express';
import handler_doCloseInventoryBatch from './admin-count-post/doCloseInventoryBatch.js';
import handler_doDeleteInventoryBatch from './admin-count-post/doDeleteInventoryBatch.js';
import handler_goGetAvailableInventoryBatches from './admin-count-post/doGetAvailableInventoryBatches.js';
import handler_doGetInventoryBatch from './admin-count-post/doGetInventoryBatch.js';
import handler_doOpenNewInventoryBatch from './admin-count-post/doOpenNewInventoryBatch.js';
import handler_reopenInventoryBatch from './admin-count-post/doReopenInventoryBatch.js';
import handler_doSyncInventoryBatch from './admin-count-post/doSyncInventoryBatch.js';
import handler_countAdmin from './admin-get/countAdmin.js';
import handler_countExport from './admin-get/countExport.js';
import handler_issueAdmin from './admin-get/issueAdmin.js';
import handler_doDeletePendingRecord from './admin-issue-post/doDeletePendingRecord.js';
import handler_doDeleteSyncErrorRecords from './admin-issue-post/doDeleteSyncErrorRecords.js';
import handler_doGetInventory from './admin-issue-post/doGetInventory.js';
import handler_doGetInventoryItemDetails from './admin-issue-post/doGetInventoryItemDetails.js';
import handler_doGetItemRequestsCount from './admin-issue-post/doGetItemRequestsCount.js';
import handler_doGetPendingRecords from './admin-issue-post/doGetPendingRecords.js';
import handler_doGetRepairRecords from './admin-issue-post/doGetRepairRecords.js';
import handler_doReturnSyncErrorRecordsToPending from './admin-issue-post/doReturnSyncErrorRecordsToPending.js';
import handler_doSyncScannerRecords from './admin-issue-post/doSyncScannerRecords.js';
import handler_doUpdatePendingRecord from './admin-issue-post/doUpdatePendingRecord.js';
import handler_doRecordCountedQuantity from './scanner-count-post/doRecordCountedQuantity.js';
export const router = Router();
/*
 * Issue Scanner
 */
router.get('/', handler_issueAdmin);
router.post('/doGetItemRequestsCount', handler_doGetItemRequestsCount);
// Pending Records
router.post('/doGetPendingRecords', handler_doGetPendingRecords);
router.post('/doGetRepairRecords', handler_doGetRepairRecords);
router.post('/doUpdatePendingRecord', handler_doUpdatePendingRecord);
router.post('/doDeletePendingRecord', handler_doDeletePendingRecord);
router.post('/doSyncScannerRecords', handler_doSyncScannerRecords);
// Sync Errors
router.post('/doReturnSyncErrorRecordsToPending', handler_doReturnSyncErrorRecordsToPending);
router.post('/doDeleteSyncErrorRecords', handler_doDeleteSyncErrorRecords);
// Inventory View
router.post('/doGetInventory', handler_doGetInventory);
router.post('/doGetInventoryItemDetails', handler_doGetInventoryItemDetails);
/*
 * Count Scanner
 */
router.get('/count', handler_countAdmin);
router.post('/doGetAvailableInventoryBatches', handler_goGetAvailableInventoryBatches);
router.post('/doOpenNewInventoryBatch', handler_doOpenNewInventoryBatch);
router.post('/doGetInventoryBatch', handler_doGetInventoryBatch);
router.post('/doDeleteInventoryBatch', handler_doDeleteInventoryBatch);
router.post('/doRecordCountedQuantity', handler_doRecordCountedQuantity);
router.post('/doCloseInventoryBatch', handler_doCloseInventoryBatch);
router.post('/doReopenInventoryBatch', handler_reopenInventoryBatch);
router.post('/doSyncInventoryBatch', handler_doSyncInventoryBatch);
router.get('/count/:batchId/export', handler_countExport);
/*
 * Export the router
 */
export default router;
