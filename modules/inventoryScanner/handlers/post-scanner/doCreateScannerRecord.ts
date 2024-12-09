import type { Request, Response } from 'express'

import createScannerRecord from '../../database/createScannerRecord.js'
import getScannerRecords from '../../database/getScannerRecords.js'

interface DoCreateScannerRecordForm {
  scannerKey: string
  workOrderNumber: string
  repairId: string
  itemNumber: string
  quantity: string
  quantityMultiplier: '1' | '-1'
}

export default function handler(
  request: Request<unknown, unknown, DoCreateScannerRecordForm>,
  response: Response
): void {
  const success = createScannerRecord(request.body)

  const records = getScannerRecords({
    scannerKey: request.body.scannerKey
  })

  response.json({ success, records })
}
