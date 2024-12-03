// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

import { getConfigProperty } from '../../../helpers/functions.config.js'
import type { InventoryScannerRecord, WorkOrderType } from '../types.js'

export function getWorkOrderTypeFromWorkOrderNumber(
  workOrderNumber: string
): WorkOrderType {
  if (
    getConfigProperty('modules.inventoryScanner.workOrders.acceptWorkTech') &&
    getConfigProperty('modules.inventoryScanner.workOrders.workTechRegex').test(
      workOrderNumber
    )
  ) {
    return 'worktech'
  }

  return 'faster'
}

export function sortScannerRecordsByWorkOrderType(
  records: InventoryScannerRecord[]
): Partial<Record<WorkOrderType, InventoryScannerRecord[]>> {
  const recordsObject: Partial<
    Record<WorkOrderType, InventoryScannerRecord[]>
  > = {}

  for (const record of records) {
    if (Object.hasOwn(recordsObject, record.workOrderType)) {
      recordsObject[record.workOrderType]?.push(record)
    } else {
      recordsObject[record.workOrderType] = [record]
    }
  }

  return recordsObject
}
