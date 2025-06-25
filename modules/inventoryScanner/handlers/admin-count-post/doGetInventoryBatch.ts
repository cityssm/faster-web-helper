import type { Request, Response } from 'express'

import getInventoryBatch from '../../database-count/getInventoryBatch.js'
import type { GetInventoryBatchItemsFilters } from '../../database-count/getInventoryBatchItems.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    GetInventoryBatchItemsFilters & { batchId: number }
  >,
  response: Response
): void {
  const batch = getInventoryBatch(request.body.batchId, request.body)
  response.json({ batch })
}
