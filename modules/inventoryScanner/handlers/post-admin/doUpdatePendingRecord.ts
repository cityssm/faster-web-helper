import type { Request, Response } from 'express'

import getScannerRecords from '../../database/getScannerRecords.js'
import {
  type UpdateScannerRecordForm,
  updateScannerRecord
} from '../../database/updateScannerRecord.js'

export default function handler(
  request: Request<unknown, unknown, UpdateScannerRecordForm>,
  response: Response
): void {
  const success = updateScannerRecord(
    request.body,
    request.session.user as FasterWebHelperSessionUser
  )

  const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 })

  response.json({ success, pendingRecords })
}
