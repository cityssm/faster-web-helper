import type { Request, Response } from 'express'

import { getOpenedInventoryBatch } from '../../database/getInventoryBatch.js'

export default function handler(request: Request, response: Response): void {
  const openBatch = getOpenedInventoryBatch(false, false)

  if (openBatch === undefined) {
    response.render('inventoryScanner/inventoryScannerCreate', {})
  } else {
    response.render('inventoryScanner/inventoryScanner', {
      headTitle: 'Inventory Scanner',

      openBatch
    })
  }
}
