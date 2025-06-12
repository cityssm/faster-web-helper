import type { Request, Response } from 'express'

import type { TaskWorkerMessage } from '../../../../types/tasks.types.js'
import createOrUpdateScannerRecord from '../../database/createOrUpdateScannerRecord.js'
import getScannerRecords from '../../database/getScannerRecords.js'

type DoCreateScannerRecordForm = {
  scannerKey: string
  workOrderNumber: string

  repairId: string

  quantity: string
  quantityMultiplier: '-1' | '1'
} & (
  | {
      itemType: 'nonStock'
      itemNumberPrefix: string
      itemNumberSuffix: string
      itemDescription: string
      unitPrice: string
    }
  | {
      itemType: 'stock'
      itemNumber: string
    }
)

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
      // eslint-disable-next-line no-secrets/no-secrets
      destinationTaskName: 'inventoryScanner_updateRecordsFromValidation',
      timeMillis: Date.now()
    } satisfies TaskWorkerMessage)
  }

  const records = getScannerRecords({
    scannerKey: request.body.scannerKey
  })

  response.json({ success, records })
}
