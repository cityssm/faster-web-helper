import { Router } from 'express'

import handler_users from './get/users.js'

export const router = Router()

router.get('/users', handler_users)

export default router