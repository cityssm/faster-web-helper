import type { Request, Response } from 'express'

import getInventoryBatch from '../../database-count/getInventoryBatch.js'
import type { GetInventoryBatchItemsFilters } from '../../database-count/getInventoryBatchItems.js'
import reopenInventoryBatch from '../../database-count/reopenInventoryBatch.js'

export default function handler(
  request: Request<unknown, unknown, GetInventoryBatchItemsFilters & { batchId: number | string }>,
  response: Response
): void {
  const result = reopenInventoryBatch(
    request.body.batchId,
    request.session.user as FasterWebHelperSessionUser
  )

  const batch = getInventoryBatch(request.body.batchId, request.body)

  response.json({ batch, message: result.message, success: result.success })
}
