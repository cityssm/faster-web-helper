import type { Request, Response } from 'express'

import deleteScannerRecord from '../../database-issue/deleteScannerRecord.js'
import getScannerRecords from '../../database-issue/getScannerRecords.js'

interface DoDeleteSyncErrorRecordsForm {
  recordIds: string[]
}

export default function handler(
  request: Request<unknown, unknown, DoDeleteSyncErrorRecordsForm>,
  response: Response
): void {
  let deleteCount = 0

  for (const recordId of request.body.recordIds) {
    if (deleteScannerRecord(recordId, request.session.user)) {
      deleteCount += 1
    }
  }

  const syncErrorRecords = getScannerRecords({
    isSynced: true,
    isSyncedSuccessfully: false
  })

  response.json({
    success: deleteCount === request.body.recordIds.length,
    syncErrorRecords
  })
}
