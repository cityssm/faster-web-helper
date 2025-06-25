import type { Request, Response } from 'express'

import type { TaskWorkerMessage } from '../../../../types/tasks.types.js'
import getScannerRecords from '../../database-issue/getScannerRecords.js'
import {
  type UpdateScannerRecordForm,
  updateScannerRecord
} from '../../database-issue/updateScannerRecord.js'

export default function handler(
  request: Request<unknown, unknown, UpdateScannerRecordForm>,
  response: Response
): void {
  const success = updateScannerRecord(
    request.body,
    request.session.user as FasterWebHelperSessionUser
  )

  if (success && process.send !== undefined) {
    process.send({
      // eslint-disable-next-line no-secrets/no-secrets
      destinationTaskName: 'inventoryScanner_updateRecordsFromValidation',
      timeMillis: Date.now()
    } satisfies TaskWorkerMessage)
  }

  const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 })

  response.json({ success, pendingRecords })
}
