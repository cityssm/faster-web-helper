import type { Request, Response } from 'express'

import createScannerRecord from '../../database/createScannerRecord.js'

interface DoCreateScannerRecordForm {
  scannerKey: string
  workOrderNumber: string
  repairId: string
  itemNumber: string
  quantity: string
}

export default function handler(request: Request<unknown, unknown, DoCreateScannerRecordForm>, response: Response): void {

  const success = createScannerRecord(request.body)

  response.json({ success })
}
