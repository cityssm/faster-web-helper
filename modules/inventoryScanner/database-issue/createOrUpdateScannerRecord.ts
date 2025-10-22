import {
  type DateString,
  type TimeString,
  dateStringToInteger,
  dateToInteger,
  dateToTimeInteger,
  timeStringToInteger
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { getConfigProperty } from '../../../helpers/config.helpers.js'
import { databasePath } from '../helpers/database.helpers.js'
import { scannerKeyToUserName } from '../helpers/scanner.helpers.js'
import { getWorkOrderTypeFromWorkOrderNumber } from '../helpers/workOrders.helpers.js'
import type { WorkOrderType } from '../types.js'

import { getItemValidationRecordsByItemNumber } from './getItemValidationRecords.js'

const secondaryWorkOrderNumber = getConfigProperty(
  'modules.inventoryScanner.fasterSync.sendCopyToWorktech.worktechWorkOrderNumber'
)
const secondarySyncIsEnabled =
  getConfigProperty(
    'modules.inventoryScanner.fasterSync.sendCopyToWorktech.isEnabled'
  ) && secondaryWorkOrderNumber !== ''

export type CreateScannerRecordForm = {
  scannerKey: string

  scannerDateString?: DateString
  scannerTimeString?: TimeString

  workOrderNumber: string
  workOrderType?: WorkOrderType

  repairId: string
  technicianId?: string

  itemStoreroom?: string

  itemNumberPrefix?: string
  itemDescription?: string

  quantity: number | string
  quantityMultiplier: -1 | '-1' | '1' | 1

  unitPrice?: number | string
} & (
  | {
      itemType: 'nonStock'
      itemNumberSuffix: string
    }
  | {
      itemType: 'stock'
      itemNumber: string
    }
)

// eslint-disable-next-line complexity
export default function createOrUpdateScannerRecord(
  scannerRecord: CreateScannerRecordForm
): boolean {
  const rightNow = new Date()

  const database = sqlite(databasePath)

  const itemNumber =
    scannerRecord.itemType === 'stock'
      ? scannerRecord.itemNumber
      : scannerRecord.itemNumberSuffix

  const itemNumberPrefix = scannerRecord.itemNumberPrefix ?? ''

  let itemStoreroom = scannerRecord.itemStoreroom
  let itemDescription = scannerRecord.itemDescription
  let unitPrice = scannerRecord.unitPrice

  if (
    scannerRecord.itemType === 'stock' &&
    (itemStoreroom === undefined || unitPrice === undefined)
  ) {
    const items = getItemValidationRecordsByItemNumber(
      itemNumber,
      itemNumberPrefix,
      database
    )

    for (const item of items) {
      itemStoreroom ??= item.itemStoreroom

      if (itemStoreroom === item.itemStoreroom) {
        itemDescription ??= item.itemDescription

        unitPrice ??= item.unitPrice

        break
      }
    }
  }

  let quantity =
    typeof scannerRecord.quantity === 'string'
      ? Number.parseInt(scannerRecord.quantity, 10)
      : scannerRecord.quantity

  if (
    scannerRecord.quantityMultiplier === '-1' ||
    scannerRecord.quantityMultiplier === -1
  ) {
    quantity = quantity * -1
  }

  const userName = scannerKeyToUserName(scannerRecord.scannerKey)

  const workOrderType =
    scannerRecord.workOrderType ??
    getWorkOrderTypeFromWorkOrderNumber(scannerRecord.workOrderNumber)

  const scanDate =
    scannerRecord.scannerDateString === undefined
      ? dateToInteger(rightNow)
      : dateStringToInteger(scannerRecord.scannerDateString)

  const scanTime =
    scannerRecord.scannerTimeString === undefined
      ? dateToTimeInteger(rightNow)
      : timeStringToInteger(scannerRecord.scannerTimeString)

  /*
   * Check if record already exists
   */

  let existingRecordSql = `select
    recordId, quantity
    from InventoryScannerRecords
    where workOrderNumber = ?
      and workOrderType = ?
      and itemNumberPrefix = ?
      and itemNumber = ?
      and itemDescription = ?
      and recordSync_timeMillis is null
      and recordDelete_timeMillis is null`

  const existingRecordParameters: Array<number | string> = [
    scannerRecord.workOrderNumber,
    workOrderType,
    itemNumberPrefix,
    itemNumber,
    itemDescription as string
  ]

  if (scannerRecord.repairId !== '') {
    existingRecordSql += ' and repairId = ?'
    existingRecordParameters.push(scannerRecord.repairId)
  }

  if (itemStoreroom !== undefined) {
    existingRecordSql += ' and itemStoreroom = ?'
    existingRecordParameters.push(itemStoreroom)
  }

  if (unitPrice !== undefined) {
    existingRecordSql += ' and unitPrice = ?'
    existingRecordParameters.push(unitPrice)
  }

  existingRecordSql += ' order by recordId desc limit 1'

  const existingRecord = database
    .prepare(existingRecordSql)
    .get(existingRecordParameters) as
    | {
        recordId: number
        quantity: number
      }
    | undefined

  let finalResult: sqlite.RunResult | undefined

  if (existingRecord === undefined) {
    finalResult = database
      .prepare(
        `insert into InventoryScannerRecords (
          scannerKey,
          scanDate, scanTime,
          workOrderNumber, workOrderType,
          technicianId, repairId,
          itemStoreroom, itemNumberPrefix, itemNumber, itemDescription,
          quantity, unitPrice,
          secondaryWorkOrderNumber, secondaryWorkOrderType,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis)
          values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        scannerRecord.scannerKey,
        scanDate,
        scanTime,
        scannerRecord.workOrderNumber,
        workOrderType,
        scannerRecord.technicianId,
        scannerRecord.repairId === '' ? undefined : scannerRecord.repairId,
        itemStoreroom,
        itemNumberPrefix,
        itemNumber,
        itemDescription,
        quantity,
        unitPrice,

        workOrderType === 'faster' && secondarySyncIsEnabled
          ? secondaryWorkOrderNumber
          : '',
        workOrderType === 'faster' && secondarySyncIsEnabled ? 'worktech' : '',

        userName,
        rightNow.getTime(),
        userName,
        rightNow.getTime()
      )
  } else {
    const newQuantity = existingRecord.quantity + quantity

    finalResult =
      newQuantity === 0
        ? database
            .prepare(
              `update InventoryScannerRecords
                set recordDelete_userName = ?,
                  recordDelete_timeMillis = ?
                where recordId = ?`
            )
            .run(userName, rightNow.getTime(), existingRecord.recordId)
        : database
            .prepare(
              `update InventoryScannerRecords
                set quantity = ?,
                  scannerKey = ?,
                  scanDate = ?,
                  scanTime = ?,
                  recordUpdate_userName = ?,
                  recordUpdate_timeMillis = ?
                where recordId = ?`
            )
            .run(
              newQuantity,
              scannerRecord.scannerKey,
              scanDate,
              scanTime,
              userName,
              rightNow.getTime(),
              existingRecord.recordId
            )
  }

  database.close()

  return finalResult.changes > 0
}
