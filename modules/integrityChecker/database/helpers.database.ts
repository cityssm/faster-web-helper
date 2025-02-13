import { minutesToMillis } from '@cityssm/to-millis'
import sqlite from 'better-sqlite3'
import camelcase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../../debug.config.js'
import { moduleName } from '../helpers/module.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelcase(moduleName)}:databaseHelpers`
)

export const databasePath = 'data/integrityChecker.db'

export const timeoutMillis = minutesToMillis(15)

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
    
    recordUpdate_timeMillis integer not null)`,

  `create table if not exists NhtsaVehicles (
    vin varchar primary key not null,
    suggestedVin varchar,

    make varchar,
    model varchar,
    year integer,

    errorCode varchar,
    errorText varchar,

    recordUpdate_timeMillis integer not null)`,

  `create table if not exists FasterInventoryItems (
    itemNumber varchar not null,
    storeroom varchar not null,

    itemName varchar not null,

    binLocation varchar not null,

    averageTrueCost decimal(18, 4) not null,
    quantityInStock integer not null,

    recordUpdate_timeMillis integer not null,
    
    primary key (itemNumber, storeroom))`,

  `create table if not exists DynamicsGpInventoryItems (
    itemNumber varchar not null,
    locationCode varchar not null,
    fasterStoreroom varchar not null,

    itemDescription varchar not null,
    itemShortName varchar not null,
    itemType varchar not null,

    binNumber varchar not null,

    currentCost decimal(18, 4) not null,
    quantityOnHand integer not null,

    recordUpdate_timeMillis integer not null,
    
    primary key (itemNumber, locationCode))`
]

export function initializeIntegrityCheckerDatabase(): boolean {
  debug(`Checking for ${databasePath}`)

  let success = false

  const database = sqlite(databasePath)

  const row = database
    .prepare(
      `select name from sqlite_master
        where type = 'table'
        and name = 'DynamicsGpInventoryItems'`
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
