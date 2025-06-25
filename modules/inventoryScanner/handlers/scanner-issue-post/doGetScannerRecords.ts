import type { Request, Response } from 'express'

import getScannerRecords from '../../database-issue/getScannerRecords.js'

interface DoGetScannerRecordsForm {
  scannerKey: string
}

export default function handler(
  request: Request<unknown, unknown, DoGetScannerRecordsForm>,
  response: Response
): void {
  const records = getScannerRecords({
    scannerKey: request.body.scannerKey
  })

  response.json({ records })
}
