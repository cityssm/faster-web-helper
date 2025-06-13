import { Router } from 'express'

import { getOpenedInventoryBatch } from '../database/getInventoryBatch.js'

import handler_inventoryScanner from './get-scanner/inventory.js'
import handler_issueScanner from './get-scanner/issue.js'
import handler_doCreateScannerRecord from './post-scanner/doCreateScannerRecord.js'
import handler_doDeleteScannerRecord from './post-scanner/doDeleteScannerRecord.js'
import handler_doGetItemDescription from './post-scanner/doGetItemDescription.js'
import handler_doGetRepairRecords from './post-scanner/doGetRepairRecords.js'
import handler_doGetScannerRecords from './post-scanner/doGetScannerRecords.js'
import handler_doRecordCountedQuantity from './post-scanner/doRecordCountedQuantity.js'

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
