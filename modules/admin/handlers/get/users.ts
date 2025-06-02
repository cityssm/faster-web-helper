import type { Request, Response } from 'express'

import { getUsers } from '../../../../database/getUsers.js'
import { userSettingNames } from '../../../../helpers/userSettings.helpers.js'

export default function handler(request: Request, response: Response): void {
  const users = getUsers()

  response.render('admin/users', {
    headTitle: 'User Management',
    users,
    userSettingNames
  })
}
