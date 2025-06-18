import type { Request, Response } from 'express'

import createOrUpdateInventoryBatchItem, {
  type InventoryBatchItemForm
} from '../../database/createOrUpdateInventoryBatchItem.js'

export default function handler(
  request: Request<unknown, unknown, InventoryBatchItemForm>,
  response: Response
): void {
  const result = createOrUpdateInventoryBatchItem(
    request.body,
    request.session.user
  )

  response.json(result)
}
