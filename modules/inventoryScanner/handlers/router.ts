import { Router } from 'express'

import handler_inventoryScanner from './get-admin/inventoryScanner.js'
import handler_doGetInventory from './post-admin/doGetInventory.js'

export const router = Router()

router.get('/', handler_inventoryScanner)

router.post('/doGetInventory', handler_doGetInventory)

export default router
