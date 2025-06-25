import type { Request, Response } from 'express'

import { getConfigProperty } from '../../../../helpers/config.helpers.js'
import getItemValidationJsonData from '../../database-issue/getItemValidationJsonData.js'

export default function handler(
  request: Request<
    unknown,
    unknown,
    {
      itemNumber: string
      itemStoreroom: string
    }
  >,
  response: Response
): void {
  const jsonData = getItemValidationJsonData(
    request.body.itemStoreroom,
    request.body.itemNumber
  )

  if (jsonData === undefined || Object.keys(jsonData).length === 0) {
    response.json({
      success: false,
      message: 'No additional details found for this item.'
    })
  } else {
    response.json({
      success: true,

      data: jsonData,
      source: getConfigProperty('modules.inventoryScanner.items.validation')
        ?.source
    })
  }
}
