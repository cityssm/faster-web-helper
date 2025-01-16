import type { Request, Response } from 'express'

import createOrUpdateScannerRecord from '../../database/createOrUpdateScannerRecord.js'
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
  const success = createOrUpdateScannerRecord(request.body)

  if (
    request.body.repairId === '' &&
    request.body.quantityMultiplier === '1' &&
    process.send !== undefined
  ) {
    process.send({
      destinationTaskName: 'inventoryScanner.updateRecordsFromValidation',
      timeMillis: Date.now()
    })
  }

  const records = getScannerRecords({
    scannerKey: request.body.scannerKey
  })

  response.json({ success, records })
}
