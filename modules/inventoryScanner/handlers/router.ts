import { Router } from 'express'

import handler_inventoryScanner from './get-admin/inventoryScanner.js'
import handler_doGetInventory from './post-admin/doGetInventory.js'
import handler_doGetPendingRecords from './post-admin/doGetPendingRecords.js'
import handler_doGetRepairRecords from './post-admin/doGetRepairRecords.js'
import handler_doUpdatePendingRecord from './post-admin/doUpdatePendingRecord.js'

export const router = Router()

router.get('/', handler_inventoryScanner)

router.post('/doGetPendingRecords', handler_doGetPendingRecords)

router.post('/doGetRepairRecords', handler_doGetRepairRecords)

router.post('/doUpdatePendingRecord', handler_doUpdatePendingRecord)

router.post('/doGetInventory', handler_doGetInventory)

export default router
