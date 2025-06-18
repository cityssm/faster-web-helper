import type { Request, Response } from 'express'

import { getAvailableInventoryBatches } from '../../database/getInventoryBatches.js'
import type { InventoryBatch } from '../../types.js'

export default function handler(
  request: Request,
  response: Response<{ inventoryBatches: InventoryBatch[] }>
): void {
  const inventoryBatches = getAvailableInventoryBatches()

  response.json({ inventoryBatches })
}
