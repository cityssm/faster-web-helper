import { Router } from 'express';
import handler_inventoryScanner from './get-admin/inventoryScanner.js';
import handler_issueScanner from './get-admin/issueScanner.js';
import handler_doDeletePendingRecord from './post-admin/doDeletePendingRecord.js';
import handler_doDeleteSyncErrorRecords from './post-admin/doDeleteSyncErrorRecords.js';
import handler_doGetInventory from './post-admin/doGetInventory.js';
import handler_doGetInventoryItemDetails from './post-admin/doGetInventoryItemDetails.js';
import handler_doGetItemRequestsCount from './post-admin/doGetItemRequestsCount.js';
import handler_doGetPendingRecords from './post-admin/doGetPendingRecords.js';
import handler_doGetRepairRecords from './post-admin/doGetRepairRecords.js';
import handler_doReturnSyncErrorRecordsToPending from './post-admin/doReturnSyncErrorRecordsToPending.js';
import handler_doSyncScannerRecords from './post-admin/doSyncScannerRecords.js';
import handler_doUpdatePendingRecord from './post-admin/doUpdatePendingRecord.js';
export const router = Router();
/*
 * Issue Scanner
 */
router.get('/', handler_issueScanner);
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
 * Inventory Scanner
 */
router.get('/inventory', handler_inventoryScanner);
/*
 * Export the router
 */
export default router;
