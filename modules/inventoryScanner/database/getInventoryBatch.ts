import {
  dateIntegerToString,
  dateToInteger,
  dateToTimeInteger,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import type { InventoryBatch, InventoryBatchItem } from '../types.js'

import { databasePath } from './helpers.database.js'

function _getInventoryBatch(
  filters: {
    batchId?: number
    isOpened?: boolean
  },
  includeBatchItems = false,
  connectedDatabase?: sqlite.Database
): InventoryBatch | undefined {
  const sqlParameters: unknown[] = []

  let sql = `select batchId,

    openDate,
    userFunction_dateIntegerToString(openDate) as openDateString,
    openTime,
    userFunction_timeIntegerToString(openTime) as openTimeString,

    closeDate,
    userFunction_dateIntegerToString(closeDate) as closeDateString,
    closeTime,
    userFunction_timeIntegerToString(closeTime) as closeTimeString,

    recordSync_userName,
    recordSync_timeMillis,

    recordCreate_userName,
    recordCreate_timeMillis,
    recordUpdate_userName,
    recordUpdate_timeMillis

    from InventoryBatches
    where recordDelete_timeMillis is null`

  if (Object.hasOwn(filters, 'isOpened') && filters.isOpened === true) {
    sql += ' and closeDate is null'
  }

  if (filters.batchId !== undefined) {
    sql += ' and batchId = ?'
    sqlParameters.push(filters.batchId)
  }

  const database =
    connectedDatabase ??
    sqlite(databasePath, {
      readonly: true
    })

  const result = database
    .function('userFunction_dateIntegerToString', dateIntegerToString)
    .function('userFunction_timeIntegerToString', timeIntegerToString)
    .prepare(sql)
    .get(...sqlParameters) as InventoryBatch | undefined

  if (result !== undefined && includeBatchItems) {
    result.batchItems = database
      .function('userFunction_dateIntegerToString', dateIntegerToString)
      .function('userFunction_timeIntegerToString', timeIntegerToString)
      .prepare(
        `select itemStoreroom, itemNumber, countedQuantity,
          scannerKey,
          scanDate,
          userFunction_timeIntegerToString(scanTime) as scanTimeString,
          
          scanTime,
          userFunction_dateIntegerToString(scanDate) as scanDateString
          from InventoryBatchItems
          where batchId = ?
          and recordDelete_timeMillis is null
          order by scanDate desc, scanTime desc`
      )
      .all(result.batchId) as InventoryBatchItem[]
  }

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}

export function getInventoryBatch(batchId: number): InventoryBatch | undefined {
  return _getInventoryBatch({ batchId }, true)
}

export function getOpenedInventoryBatch(
  includeBatchItems = false,
  createIfNotExists = false,
  user?: FasterWebHelperSessionUser
): InventoryBatch | undefined {
  const database = sqlite(databasePath)

  let openBatch = _getInventoryBatch({ isOpened: true }, includeBatchItems, database)

  if (openBatch === undefined && createIfNotExists) {
    const rightNow = new Date()

    const result = database
      .prepare(
        `insert into InventoryBatches (
          openDate, openTime,
          recordCreate_userName, recordCreate_timeMillis,
          recordUpdate_userName, recordUpdate_timeMillis
        ) values (
          ?, ?,
          ?, ?,
          ?, ?
        )`
      )
      .run(
        dateToInteger(rightNow),
        dateToTimeInteger(rightNow),
        user?.userName ?? 'scanner',
        Date.now(),
        user?.userName ?? 'scanner',
        Date.now()
      )

    const newBatchId = result.lastInsertRowid as number

    openBatch = _getInventoryBatch({ batchId: newBatchId }, false)

    if (openBatch === undefined) {
      return undefined
    }

    openBatch.batchItems = []
  }

  database.close()

  return openBatch
}
