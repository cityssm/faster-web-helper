import { Router } from 'express'

import handler_users from './get/users.js'
import handler_doUpdateUser from './post/doUpdateUser.js'

export const router = Router()

router.get('/users', handler_users)

router.post('/doUpdateUser', handler_doUpdateUser)

export default router
