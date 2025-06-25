import type { Request, Response } from 'express'

import { getItemValidationRecordsByItemNumber } from '../../database-issue/getItemValidationRecords.js'

interface DoGetItemDescriptionForm {
  itemNumber: string
}

interface DoGetItemDescriptionReturn {
  itemDescription: string
  unitPrice?: number
}

export default function handler(
  request: Request<unknown, unknown, DoGetItemDescriptionForm>,
  response: Response<DoGetItemDescriptionReturn>
): void {
  const itemValidationRecords = getItemValidationRecordsByItemNumber(
    request.body.itemNumber,
    ''
  )

  if (itemValidationRecords.length === 0) {
    response.json({
      itemDescription: `Item Not Found: ${request.body.itemNumber}`
    })
  } else {
    response.json({
      itemDescription: itemValidationRecords[0].itemDescription,
      unitPrice: itemValidationRecords[0].unitPrice
    })
  }
}
