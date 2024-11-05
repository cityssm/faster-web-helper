import { Router } from 'express'

import handler_inventoryScanner from './get-admin/inventoryScanner.js'

export const router = Router()

router.get('/', handler_inventoryScanner)

export default router
