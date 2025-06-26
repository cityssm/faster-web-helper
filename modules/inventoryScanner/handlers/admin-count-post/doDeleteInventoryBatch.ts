import type { Request, Response } from 'express'

import deleteInventoryBatch from '../../database-count/deleteInventoryBatch.js'

export default function handler(
  request: Request<unknown, unknown, { batchId: number | string }>,
  response: Response
): void {
  const success = deleteInventoryBatch(
    request.body.batchId,
    request.session.user as FasterWebHelperSessionUser
  )

  response.json({ success })
}
