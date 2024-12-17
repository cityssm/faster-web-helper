import { Router } from 'express'

import handler_inventoryScanner from './get-admin/inventoryScanner.js'
import handler_doDeletePendingRecord from './post-admin/doDeletePendingRecord.js'
import handler_doDeleteSyncErrorRecords from './post-admin/doDeleteSyncErrorRecords.js'
import handler_doGetInventory from './post-admin/doGetInventory.js'
import handler_doGetItemRequestsCount from './post-admin/doGetItemRequestsCount.js'
import handler_doGetPendingRecords from './post-admin/doGetPendingRecords.js'
import handler_doGetRepairRecords from './post-admin/doGetRepairRecords.js'
import handler_doReturnSyncErrorRecordsToPending from './post-admin/doReturnSyncErrorRecordsToPending.js'
import handler_doSyncScannerRecords from './post-admin/doSyncScannerRecords.js'
import handler_doUpdatePendingRecord from './post-admin/doUpdatePendingRecord.js'

export const router = Router()

router.get('/', handler_inventoryScanner)

router.post('/doGetItemRequestsCount', handler_doGetItemRequestsCount)

/*
 * Pending Records
 */

router.post('/doGetPendingRecords', handler_doGetPendingRecords)

router.post('/doGetRepairRecords', handler_doGetRepairRecords)

router.post('/doUpdatePendingRecord', handler_doUpdatePendingRecord)

router.post('/doDeletePendingRecord', handler_doDeletePendingRecord)

router.post('/doSyncScannerRecords', handler_doSyncScannerRecords)

/*
 * Sync Errors
 */

router.post(
  '/doReturnSyncErrorRecordsToPending',
  handler_doReturnSyncErrorRecordsToPending
)

router.post('/doDeleteSyncErrorRecords', handler_doDeleteSyncErrorRecords)

/*
 * Inventory
 */

router.post('/doGetInventory', handler_doGetInventory)

export default router
