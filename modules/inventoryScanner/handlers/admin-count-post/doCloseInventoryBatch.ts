import type { Request, Response } from 'express'

import closeInventoryBatch from '../../database-count/closeInventoryBatch.js'
import getInventoryBatch from '../../database-count/getInventoryBatch.js'

export default function handler(
  request: Request<unknown, unknown, { batchId: number | string }>,
  response: Response
): void {
  const success = closeInventoryBatch(
    request.body.batchId,
    request.session.user as FasterWebHelperSessionUser
  )

  const batch = getInventoryBatch(request.body.batchId)

  response.json({ batch, success })
}
