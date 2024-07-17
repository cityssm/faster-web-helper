import sqlite from 'better-sqlite3'
import Debug from 'debug'

const debug = Debug('faster-web-helper:worktechUpdate:databaseHelpers')

export const databasePath = 'data/worktechUpdate.db'

const createStatements = [
  // eslint-disable-next-line no-secrets/no-secrets
  `create table if not exists WorkOrderNumberMappings (
    documentNumber integer primary key not null,
    workOrderNumber char(11) not null,
    exportDate integer not null,
    exportTime integer not null)`,

  `create table if not exists ReturnToVendorRecords (
    documentNumber integer not null,
    storeroom varchar(20) not null,
    itemNumber varchar(100) not null,
    transactionDate integer not null,
    quantity decimal(8, 3) not null,
    cost decimal(10, 3) not null,
    primary key (documentNumber, storeroom, itemNumber, transactionDate, quantity, cost))`
]

export function initializeWorktechUpdateDatabase(): boolean {
  let success = false

  const database = sqlite(databasePath)

  const row = database
    .prepare(
      // eslint-disable-next-line no-secrets/no-secrets
      `select name from sqlite_master
        where type = 'table'
        and name = 'WorkOrderNumberMappings'`
    )
    .get()

  if (row === undefined) {
    debug(`Creating ${databasePath}`)

    for (const sql of createStatements) {
      database.prepare(sql).run()
    }

    success = true
  }

  database.close()

  return success
}
