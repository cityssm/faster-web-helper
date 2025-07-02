import Papa from 'papaparse'

import { getConfigProperty } from '../../../helpers/config.helpers.js'
import type { ConfigCountExportColumn } from '../config/types.js'
import type { InventoryBatch } from '../types.js'

export function countBatchToCSV(batch: InventoryBatch): string {
  const batchItems = [] as Array<
    Record<ConfigCountExportColumn, number | string>
  >

  for (const batchItem of batch.batchItems ?? []) {
    batchItems.push({
      batchId: batch.batchId,

      batchOpenDate: batch.openDateString,
      batchOpenTime: batch.openTimeString,

      batchCloseDate: batch.closeDateString ?? '',
      batchCloseTime: batch.closeTimeString ?? '',

      itemStoreroom: batchItem.itemStoreroom,

      itemNumber: batchItem.itemNumber,

      countedQuantity: batchItem.countedQuantity ?? '',

      countedDate:
        batchItem.scanDateString ??
        batch.closeDateString ??
        batch.openDateString,

      countedTime:
        batchItem.scanTimeString ??
        batch.closeTimeString ??
        batch.openTimeString,

      scannerKey: batchItem.scannerKey ?? ''
    })
  }

  const csv = Papa.unparse(batchItems, {
    header: true,

    columns: getConfigProperty('modules.inventoryScanner.countExport.columns'),

    delimiter: ',',
    quoteChar: '"'
  }) as string

  return csv
}
