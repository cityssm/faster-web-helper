import type { Request, Response } from 'express'

import getScannerRecords from '../../database-issue/getScannerRecords.js'
import type { InventoryScannerRecord } from '../../types.js'

export default function handler(
  request: Request,
  response: Response<{ pendingRecords: InventoryScannerRecord[] }>
): void {
  const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 })

  response.json({ pendingRecords })
}
