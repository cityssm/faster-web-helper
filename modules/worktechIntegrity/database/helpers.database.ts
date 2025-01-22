import sqlite from 'better-sqlite3'
import camelcase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../../debug.config.js'
import { moduleName } from '../helpers/module.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelcase(moduleName)}:databaseHelpers`
)

export const databasePath = 'data/worktechIntegrity.db'

const createStatements = [
  `create table if not exists FasterAssets (
    assetNumber varchar not null,
    organization varchar not null,

    vinSerial varchar,
    vinSerialIsValid integer,
    license varchar,

    year integer,
    make varchar,
    model varchar,

    recordUpdate_timeMillis integer not null,

    primary key (assetNumber, organization))`,

  `create table if not exists WorktechEquipment (
    equipmentSystemId integer primary key not null,
    equipmentId varchar not null,
    
    vinSerial varchar,
    license varchar,
    
    year integer,
    make varchar,
    model varchar,
    
    recordUpdate_timeMillis integer not null)`
]

export function initializeWorktechIntegrityDatabase(): boolean {
  debug(`Checking for ${databasePath}`)

  let success = false

  const database = sqlite(databasePath)

  const row = database
    .prepare(
      `select name from sqlite_master
        where type = 'table'
        and name = 'WorktechEquipment'`
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
