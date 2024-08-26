import type { Request, Response } from 'express'

import { getUserByUserKeyGuid } from '../../database/getUser.js'

export default function handler(request: Request, response: Response): void {
  const userKeyGuid = (request.body.userKeyGuid ?? '') as string

  const user = getUserByUserKeyGuid(userKeyGuid)

  if (user === undefined) {
    response.json({
      isLoggedIn: false
    })
  } else {
    request.session.purchaseOrderApprovalUser = {
      userName: user.userName,
      approvalMax: user.approvalMax,
      userKeyGuid: user.userKeyGuid,
      isAdmin: user.isAdmin
    }

    response.json({
      isLoggedIn: true,
      userName: user.userName,
      userKeyGuid: user.userKeyGuid
    })
  }
}
