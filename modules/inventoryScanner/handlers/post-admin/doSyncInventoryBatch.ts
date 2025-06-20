import type { Request, Response } from 'express'

import getInventoryBatch from '../../database/getInventoryBatch.js'
import syncInventoryBatch from '../../database/syncInventoryBatch.js'

export default function handler(
  request: Request<unknown, unknown, { batchId: number | string }>,
  response: Response
): void {
  const success = syncInventoryBatch(
    request.body.batchId,
    request.session.user as FasterWebHelperSessionUser
  )

  const batch = getInventoryBatch(request.body.batchId)

  response.json({ batch, success })
}
