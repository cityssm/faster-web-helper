import type { Request, Response } from 'express'

import getInventoryBatch from '../../database/getInventoryBatch.js'

export default function handler(
  request: Request<unknown, unknown, { batchId: number }>,
  response: Response
): void {
  const batch = getInventoryBatch(request.body.batchId)
  response.json({ batch })
}
