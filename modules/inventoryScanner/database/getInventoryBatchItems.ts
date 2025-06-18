import {
  dateIntegerToString,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import type { InventoryBatchItem } from '../types.js'

import { databasePath } from './helpers.database.js'

export function getInventoryBatchItems(
  batchId: number | string,
  connectedDatabase?: sqlite.Database
): InventoryBatchItem[] {
  const database =
    connectedDatabase ??
    sqlite(databasePath, {
      readonly: true
    })

  const result = database
    .function('userFunction_dateIntegerToString', dateIntegerToString)
    .function('userFunction_timeIntegerToString', timeIntegerToString)
    .prepare(
      `select b.itemStoreroom, b.itemNumber,
        v.itemDescription,
        b.countedQuantity,
        b.scannerKey,
        b.scanDate,
        userFunction_timeIntegerToString(b.scanTime) as scanTimeString,
        
        b.scanTime,
        userFunction_dateIntegerToString(b.scanDate) as scanDateString

        from InventoryBatchItems b
        left join ItemValidationRecords v on b.itemStoreroom = v.itemStoreroom
          and b.itemNumber = v.itemNumber
          and v.recordDelete_timeMillis is null

        where b.batchId = ?
          and b.recordDelete_timeMillis is null

        order by b.scanDate desc, b.scanTime desc`
    )
    .all(batchId) as InventoryBatchItem[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}
