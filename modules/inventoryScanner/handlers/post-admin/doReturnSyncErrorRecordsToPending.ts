import type { Request, Response } from 'express'

import getScannerRecords from '../../database/getScannerRecords.js'
import { markSyncErrorScannerRecordForPending } from '../../database/markSyncErrorScannerRecordForPending.js'

interface DoReturnSyncErrorRecordsForm {
  recordIds: string[]
}

export default function handler(
  request: Request<unknown, unknown, DoReturnSyncErrorRecordsForm>,
  response: Response
): void {
  let returnCount = 0

  for (const recordId of request.body.recordIds) {
    if (
      markSyncErrorScannerRecordForPending(
        recordId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        request.session.user as FasterWebHelperSessionUser
      )
    ) {
      returnCount += 1
    }
  }

  const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 })

  const syncErrorRecords = getScannerRecords({
    isSynced: true,
    isSyncedSuccessfully: false
  })

  response.json({
    success: returnCount === request.body.recordIds.length,
    pendingRecords,
    syncErrorRecords
  })
}