import sqlite from 'better-sqlite3'

import type { ItemValidationRecord } from '../types.js'

import { databasePath } from './helpers.database.js'

export default function getItemValidationRecords(
  itemNumberPrefix?: string
): ItemValidationRecord[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  let sql = `select itemStoreroom, itemNumberPrefix, itemNumber,
    itemDescription, availableQuantity, unitPrice
    from ItemValidationRecords
    where recordDelete_timeMillis is null`

  const sqlParameters: string[] = []

  if (itemNumberPrefix !== undefined) {
    sql += ' and itemNumberPrefix = ?'
    sqlParameters.push(itemNumberPrefix)
  }

  sql += ` order by itemStoreroom, itemNumber`

  const result = database
    .prepare(sql)
    .all(sqlParameters) as ItemValidationRecord[]

  database.close()

  return result
}

export function getItemValidationRecordsByItemNumber(
  itemNumber: string,
  itemNumberPrefix: string,
  connectedDatabase?: sqlite.Database
): ItemValidationRecord[] {
  const database =
    connectedDatabase ??
    sqlite(databasePath, {
      readonly: true
    })

  const result = database
    .prepare(
      `select itemStoreroom, itemNumberPrefix, itemNumber,
        itemDescription, availableQuantity, unitPrice
        from ItemValidationRecords
        where recordDelete_timeMillis is null
        and itemNumber = ?
        and itemNumberPrefix = ?
        order by itemStoreroom`
    )
    .all(itemNumber, itemNumberPrefix) as ItemValidationRecord[]

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}
