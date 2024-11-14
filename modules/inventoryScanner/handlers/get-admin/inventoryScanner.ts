import type { Request, Response } from 'express'

import getItemValidationRecords from '../../database/getItemValidationRecords.js'

export default function handler(request: Request, response: Response): void {
  const inventory = getItemValidationRecords()

  response.render('inventoryScanner/admin', {
    headTitle: 'Inventory Scanner',
    inventory
  })
}
