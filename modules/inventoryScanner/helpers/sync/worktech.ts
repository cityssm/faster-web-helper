import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime'
import {
  type CreateStockTransactionBatch,
  WorkTechAPI
} from '@cityssm/worktech-api'
import camelcase from 'camelcase'
import Debug from 'debug'

import { getConfigProperty } from '../../../../helpers/functions.config.js'
import type { InventoryScannerRecord } from '../../types.js'
import { moduleName } from '../module.js'

import { updateMultipleScannerRecords } from './syncHelpers.js'

const debug = Debug(`faster-web-helper:${camelcase(moduleName)}:syncWorktech`)

const worktechConfig = getConfigProperty('worktech')

export async function syncScannerRecordsWithWorktech(
  records: InventoryScannerRecord[]
): Promise<void> {
  if (worktechConfig === undefined) {
    debug('Missing Worktech configuration.')
    return
  }

  const currentDate = new Date()
  const currentDateString = dateToString(currentDate)
  const currentTimeString = dateToTimePeriodString(currentDate)

  const batch: CreateStockTransactionBatch = {
    batchDate: currentDateString,
    batchDescription: `${currentDateString} ${currentTimeString} - Inventory Scanner - FASTER Web Helper`,
    entries: []
  }

  for (const record of records) {
    batch.entries.push({
      entryDate: record.scanDateString,
      workOrderNumber: record.workOrderNumber,
      itemNumber: record.itemNumber,
      quantity: record.quantity
    })
  }

  if (batch.entries.length > 0) {
    const worktech = new WorkTechAPI(worktechConfig)

    try {
      const batchId = await worktech.createStockTransactionBatch(batch)

      updateMultipleScannerRecords(records, new Set(), {
        isSuccessful: true,
        message: 'Stock transactions batch created successfully.',
        syncedRecordId: batchId.toString()
      })
    } catch {
      updateMultipleScannerRecords(records, new Set(), {
        isSuccessful: false,
        message: 'Error creating stock transactions batch.'
      })
    }
  }
}
