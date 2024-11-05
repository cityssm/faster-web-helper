import { Router } from 'express'

import handler_inventoryScanner from './get/inventoryScanner.js'

export const router = Router()

router.get('/', handler_inventoryScanner)

export default router
