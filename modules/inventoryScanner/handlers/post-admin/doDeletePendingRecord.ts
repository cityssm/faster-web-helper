import type { Request, Response } from 'express'

import deleteScannerRecord from '../../database/deleteScannerRecord.js'
import getScannerRecords from '../../database/getScannerRecords.js'

interface DoDeletePendingRecordForm {
  recordId: string
}

export default function handler(
  request: Request<unknown, unknown, DoDeletePendingRecordForm>,
  response: Response
): void {
  const success = deleteScannerRecord(
    request.body.recordId,
    request.session.user
  )

  const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 })

  response.json({ success, pendingRecords })
}
