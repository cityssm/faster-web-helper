import type { Request, Response } from 'express'

import deleteScannerRecord from '../../database/deleteScannerRecord.js'
import getScannerRecords from '../../database/getScannerRecords.js'

interface DoDeleteScannerRecordForm {
  recordId: string
  scannerKey: string
}

export default function handler(
  request: Request<unknown, unknown, DoDeleteScannerRecordForm>,
  response: Response
): void {
  const success = deleteScannerRecord(
    request.body.recordId,
    request.body.scannerKey
  )

  const records = getScannerRecords({
    scannerKey: request.body.scannerKey
  })

  response.json({ success, records })
}
