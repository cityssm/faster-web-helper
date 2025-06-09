import type { Request, Response } from 'express'

import { getUsers } from '../../../../database/getUsers.js'
import updateUser, {
  type DoUpdateUserForm
} from '../../../../database/updateUser.js'

export default function handler(
  request: Request<unknown, unknown, DoUpdateUserForm>,
  response: Response
): void {
  const success = updateUser(
    request.body,
    request.session.user as FasterWebHelperSessionUser
  )

  const users = getUsers()

  response.json({ success, users })
}
