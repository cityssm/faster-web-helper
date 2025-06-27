import type { Request, Response } from 'express'

import { getOpenedInventoryBatch } from '../../database-count/getInventoryBatch.js'

export default function handler(request: Request, response: Response): void {
  const openBatch = getOpenedInventoryBatch(false, false)

  if (openBatch === undefined) {
    response.render('inventoryScanner/countScannerCreate', {})
  } else {
    response.render('inventoryScanner/countScanner', {
      headTitle: 'Count Scanner',

      openBatch
    })
  }
}
