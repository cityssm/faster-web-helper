import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  dateToTimeInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { scannerKeyToUserName } from '../helpers/scanner.js'
import { getWorkOrderTypeFromWorkOrderNumber } from '../helpers/workOrders.js'
import type { WorkOrderType } from '../types.js'

import { getItemValidationRecordsByItemNumber } from './getItemValidationRecords.js'
import { databasePath } from './helpers.database.js'

export interface CreateScannerRecordForm {
  scannerKey: string
  scannerDateString?: DateString
  scannerTimeString?: TimeString

  workOrderNumber: string
  workOrderType?: WorkOrderType
  technicianId?: string
  repairId: string

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

  let itemStoreroom = scannerRecord.itemStoreroom
  let unitPrice = scannerRecord.unitPrice

  if (itemStoreroom === undefined || unitPrice === undefined) {
    const items = getItemValidationRecordsByItemNumber(scannerRecord.itemNumber)
    
    for (const item of items) {
      if (itemStoreroom === undefined) {
        itemStoreroom = item.itemStoreroom
      }

      if (itemStoreroom === item.itemStoreroom && unitPrice === undefined) {
        unitPrice = item.unitPrice
        break
      }
    }
  }

  const userName = scannerKeyToUserName(scannerRecord.scannerKey)

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
      scannerRecord.repairId === '' ? undefined : scannerRecord.repairId,
      itemStoreroom,
      scannerRecord.itemNumber,
      scannerRecord.quantity,
      unitPrice,
      userName,
      rightNow.getTime(),
      userName,
      rightNow.getTime()
    )

  database.close()

  return result.changes > 0
}
