import { fork } from 'node:child_process'

import type { Request, Response } from 'express'

import getScannerRecords from '../../database/getScannerRecords.js'
import { markPendingScannerRecordsForSync } from '../../database/markPendingScannerRecordsForSync.js'

export default function handler(request: Request, response: Response): void {
  const syncedRecordCount = markPendingScannerRecordsForSync(
    request.session.user as FasterWebHelperSessionUser
  )

  fork('./modules/inventoryScanner/tasks/syncScannerRecords.js')

  const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 })

  response.json({ syncedRecordCount, pendingRecords })
}