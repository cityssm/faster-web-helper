import {
  type DateString,
  dateIntegerToString,
  dateStringToInteger,
  timeIntegerToString
} from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'
import type { InventoryScannerRecord, WorkOrderType } from '../types.js'

export interface GetScannerRecordsFilters {
  scannerKey?: string

  isSynced?: boolean
  isSyncedSuccessfully?: boolean
  isMarkedForSync?: boolean
  syncedRecordId?: string

  hasMissingValidation?: boolean
  workOrderType?: WorkOrderType
  itemNumberPrefix?: string

  scanDateStringFrom?: DateString
  scanDateStringTo?: DateString
}

interface GetScannerRecordsOptions {
  limit: number
}

const defaultOptions: GetScannerRecordsOptions = {
  limit: -1
}

export default function getScannerRecords(
  filters: GetScannerRecordsFilters,
  userOptions: Partial<GetScannerRecordsOptions> = {},
  connectedDatabase?: sqlite.Database
): InventoryScannerRecord[] {
  const options = {
    ...defaultOptions,
    ...userOptions
  }

  /*
   * Filters
   */

  const sqlParameters: unknown[] = []
  let sqlWhereClause = 'where s.recordDelete_timeMillis is null'

  if (filters.scannerKey !== undefined) {
    sqlWhereClause += ' and s.scannerKey = ?'
    sqlParameters.push(filters.scannerKey)
  }

  if (filters.isSynced !== undefined) {
    sqlWhereClause += filters.isSynced
      ? ' and s.recordSync_timeMillis is not null'
      : ' and s.recordSync_timeMillis is null'
  }

  if (filters.isSyncedSuccessfully !== undefined) {
    sqlWhereClause += ' and s.recordSync_isSuccessful = ?'
    sqlParameters.push(filters.isSyncedSuccessfully ? 1 : 0)
  }

  if (filters.isMarkedForSync !== undefined) {
    sqlWhereClause += filters.isMarkedForSync
      ? ' and s.recordSync_timeMillis is not null and recordSync_isSuccessful is null'
      : ' and (s.recordSync_timeMillis is null or s.recordSync_isSuccessful is not null)'
  }

  if (filters.syncedRecordId !== undefined) {
    sqlWhereClause += ' and s.recordSync_syncedRecordId = ?'
    sqlParameters.push(filters.syncedRecordId)
  }

  if (filters.hasMissingValidation !== undefined) {
    sqlWhereClause += filters.hasMissingValidation
      ? ` and (
          (s.workOrderType = 'faster' and (s.repairId is null or w.repairDescription is null))
          or s.itemStoreRoom is null
          or s.unitPrice is null
          or i.itemDescription is null
          )`
      : `and (
          (s.workOrderType <> 'faster' or (s.repairId is not null and w.repairDescription is not null))
          and s.itemStoreroom is not null
          and s.unitPrice is not null
          and i.itemDescription is not null
          )`
  }

  if (filters.workOrderType !== undefined) {
    sqlWhereClause += ' and s.workOrderType = ?'
    sqlParameters.push(filters.workOrderType)
  }

  if (filters.itemNumberPrefix !== undefined) {
    sqlWhereClause += ' and s.itemNumberPrefix = ?'
    sqlParameters.push(filters.itemNumberPrefix)
  }

  if (filters.scanDateStringFrom !== undefined) {
    sqlWhereClause += ' and s.scanDate >= ?'
    sqlParameters.push(dateStringToInteger(filters.scanDateStringFrom))
  }

  if (filters.scanDateStringTo !== undefined) {
    sqlWhereClause += ' and s.scanDate <= ?'
    sqlParameters.push(dateStringToInteger(filters.scanDateStringTo))
  }

  /*
   * Build SQL
   */

  let sql = `select s.recordId, s.scannerKey,
      s.scanDate, userFunction_dateIntegerToString(s.scanDate) as scanDateString,
      s.scanTime, userFunction_timeIntegerToString(s.scanTime) as scanTimeString,
      s.workOrderNumber, s.workOrderType,
      s.technicianId,
      s.repairId, w.repairDescription,
      s.itemStoreroom, s.itemNumberPrefix, s.itemNumber,
      case
        when s.itemDescription is null or s.itemDescription = '' then i.itemDescription
        else s.itemDescription
        end as itemDescription,
      s.quantity, s.unitPrice, i.availableQuantity,

      s.recordSync_userName, s.recordSync_timeMillis,
      s.recordSync_isSuccessful,
      s.recordSync_syncedRecordId, s.recordSync_message,

      s.secondaryWorkOrderNumber, s.secondaryWorkOrderType,
      s.secondaryRecordSync_userName, s.secondaryRecordSync_timeMillis,
      s.secondaryRecordSync_isSuccessful, s.secondaryRecordSync_syncedRecordId,
      s.secondaryRecordSync_message
    from InventoryScannerRecords s
    left join ItemValidationRecords i
      on s.itemStoreroom = i.itemStoreroom
      and s.itemNumber = i.itemNumber
      and i.recordDelete_timeMillis is null
    left join WorkOrderValidationRecords w
      on s.workOrderNumber = w.workOrderNumber
      and s.workOrderType = w.workOrderType
      and s.repairId = w.repairId
      and w.recordDelete_timeMillis is null
    ${sqlWhereClause}
    order by s.scanDate desc, s.scanTime desc, s.recordId desc`

  if (options.limit !== -1) {
    sql += ` limit ${options.limit.toString()}`
  }

  /*
   * Do Query
   */

  const database =
    connectedDatabase ??
    sqlite(databasePath, {
      readonly: true
    })

  const result = database
    .function('userFunction_dateIntegerToString', dateIntegerToString)
    .function('userFunction_timeIntegerToString', timeIntegerToString)
    .prepare(sql)
    .all(sqlParameters) as InventoryScannerRecord[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}
