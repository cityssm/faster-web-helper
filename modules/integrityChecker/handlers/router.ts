import { Router } from 'express'

import handler_faster from './get/faster.js'
import handler_worktech from './get/worktech.js'

export const router = Router()

router.get('/faster', handler_faster)

router.get('/worktech', handler_worktech)

export default router
