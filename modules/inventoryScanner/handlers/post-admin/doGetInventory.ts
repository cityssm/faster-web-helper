import type { Request, Response } from 'express'

import getItemValidationRecords from '../../database/getItemValidationRecords.js'
import type { ItemValidationRecord } from '../../types.js'

export default function handler(
  request: Request,
  response: Response<{ inventory: ItemValidationRecord[] }>
): void {
  const inventory = getItemValidationRecords()

  response.json({ inventory })
}
