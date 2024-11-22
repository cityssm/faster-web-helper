import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  dateToTimeInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getWorkOrderTypeFromWorkOrderNumber } from '../helpers/workOrders.js'
import type { WorkOrderType } from '../types.js'

import { databasePath } from './helpers.database.js'

export interface CreateScannerRecordForm {
  scannerKey: string
  scannerDateString?: DateString
  scannerTimeString?: TimeString

  workOrderNumber: string
  workOrderType?: WorkOrderType
  technicianId?: string
  repairId?: string

  itemStoreroom?: string
  itemNumber: string
  quantity: number | string
  unitPrice?: number | string
}

export default function createScannerRecord(
  scannerRecord: CreateScannerRecordForm
): boolean {
  const rightNow = new Date()

  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `insert into InventoryScannerRecords (
        scannerKey,
        scanDate, scanTime,
        workOrderNumber, workOrderType,
        technicianId, repairId,
        itemStoreroom, itemNumber,
        quantity, unitPrice,
        recordCreate_userName, recordCreate_timeMillis,
        recordUpdate_userName, recordUpdate_timeMillis)
        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      scannerRecord.scannerKey,
      scannerRecord.scannerDateString === undefined
        ? dateToInteger(rightNow)
        : dateStringToInteger(scannerRecord.scannerDateString),
      scannerRecord.scannerTimeString === undefined
        ? dateToTimeInteger(rightNow)
        : timeStringToInteger(scannerRecord.scannerTimeString),
      scannerRecord.workOrderNumber,
      scannerRecord.workOrderType ??
        getWorkOrderTypeFromWorkOrderNumber(scannerRecord.workOrderNumber),
      scannerRecord.technicianId,
      scannerRecord.repairId,
      scannerRecord.itemStoreroom,
      scannerRecord.itemNumber,
      scannerRecord.quantity,
      scannerRecord.unitPrice,
      `scanner:${scannerRecord.scannerKey}`,
      rightNow.getTime(),
      `scanner:${scannerRecord.scannerKey}`,
      rightNow.getTime()
    )

  database.close()

  return result.changes > 0
}