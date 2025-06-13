import type { Request, Response } from 'express'

import getItemValidationRecords from '../../database/getItemValidationRecords.js'
import getScannerRecords from '../../database/getScannerRecords.js'
import getSetting from '../../database/getSetting.js'

export default function handler(request: Request, response: Response): void {
  const pendingRecords = getScannerRecords({ isSynced: false }, { limit: -1 })

  const syncErrorRecords = getScannerRecords({
    isSynced: true,
    isSyncedSuccessfully: false
  })

  const inventory = getItemValidationRecords('')

  const itemRequestsCount = Number.parseInt(getSetting('itemRequests.count') ?? '0')

  response.render('inventoryScanner/adminIssue', {
    headTitle: 'Issue Scanner',
    inventory,
    pendingRecords,
    syncErrorRecords,
    itemRequestsCount
  })
}
