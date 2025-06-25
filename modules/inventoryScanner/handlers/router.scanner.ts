import { Router } from 'express'

import { getOpenedInventoryBatch } from '../database-count/getInventoryBatch.js'

import handler_doRecordCountedQuantity from './scanner-count-post/doRecordCountedQuantity.js'
import handler_inventoryScanner from './scanner-get/count.js'
import handler_issueScanner from './scanner-get/issue.js'
import handler_doCreateScannerRecord from './scanner-issue-post/doCreateScannerRecord.js'
import handler_doDeleteScannerRecord from './scanner-issue-post/doDeleteScannerRecord.js'
import handler_doGetItemDescription from './scanner-issue-post/doGetItemDescription.js'
import handler_doGetRepairRecords from './scanner-issue-post/doGetRepairRecords.js'
import handler_doGetScannerRecords from './scanner-issue-post/doGetScannerRecords.js'

export const router = Router()

/*
 * Issue Scanner
 */

router.get('/', handler_issueScanner)

router.post('/doGetRepairRecords', handler_doGetRepairRecords)

router.post('/doGetItemDescription', handler_doGetItemDescription)

router.post('/doCreateScannerRecord', handler_doCreateScannerRecord)

router.post('/doDeleteScannerRecord', handler_doDeleteScannerRecord)

router.post('/doGetScannerRecords', handler_doGetScannerRecords)

/*
 * Inventory Scanner
 */

router.get('/inventory', handler_inventoryScanner)

router.post(
  '/inventory',
  (_request, _response, next) => {
    getOpenedInventoryBatch(false, true)
    next()
  },
  handler_inventoryScanner
)

router.post('/doRecordCountedQuantity', handler_doRecordCountedQuantity)

/*
 * Export the router
 */

export default router
