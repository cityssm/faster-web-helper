import type { Request, Response } from 'express'

import { getOpenedInventoryBatch } from '../../database-count/getInventoryBatch.js'
import type { InventoryBatch } from '../../types.js'

export default function handler(request: Request, response: Response): void {
  const batch = getOpenedInventoryBatch(false, true) as InventoryBatch
  batch.batchItems ??= []

  response.json({ batch })
}
