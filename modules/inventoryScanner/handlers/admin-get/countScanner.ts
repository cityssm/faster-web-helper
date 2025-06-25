import type { Request, Response } from 'express'

import { getOpenedInventoryBatch } from '../../database-count/getInventoryBatch.js'

export default function handler(request: Request, response: Response): void {

  const openBatch = getOpenedInventoryBatch(true, false)

  response.render('inventoryScanner/adminInventory', {
    headTitle: 'Inventory Scanner',

    openBatch
  })
}
