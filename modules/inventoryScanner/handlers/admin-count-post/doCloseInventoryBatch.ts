import type { Request, Response } from 'express'

import closeInventoryBatch from '../../database-count/closeInventoryBatch.js'
import getInventoryBatch from '../../database-count/getInventoryBatch.js'
import type { GetInventoryBatchItemsFilters } from '../../database-count/getInventoryBatchItems.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    GetInventoryBatchItemsFilters & { batchId: number | string }
  >,
  response: Response
): void {
  const success = closeInventoryBatch(
    request.body.batchId,
    request.session.user as FasterWebHelperSessionUser
  )

  const batch = getInventoryBatch(request.body.batchId, request.body)

  response.json({ batch, success })
}
