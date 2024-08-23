import sqlite from 'better-sqlite3'
import camelcase from 'camelcase'
import Debug from 'debug'

import { moduleName } from '../helpers/moduleHelpers.js'

const debug = Debug(
  `faster-web-helper:${camelcase(moduleName)}:databaseHelpers`
)

export const databasePath = 'data/purchaseOrderApprovals.db'

const createStatements = [
  `create table if not exists Users (
    userName varchar(20) primary key not null,
    fasterWebUserName varchar(20),
    emailAddress varchar(100),
    approvalMax integer not null default 0,
    userKeyGuid char(32) not null unique,
    parentUserName varchar(20),
    backupUserName varchar(20),
    isAdmin bit not null default 0,
    isActive bit not null default 1)`,

  `create table if not exists PurchaseOrders (
    tenant varchar(50) not null,
    orderNumber integer not null,
    lastUpdatedDate integer not null,
    lastUpdatedTime integer not null,
    orderTotal decimal(10, 2) not null default 0,
    purchaseOrderKeyGuid char(32) not null unique,
    primary key (tenant, orderNumber))`,

  `create table if not exists Approvals (
    tenant varchar(50) not null,
    orderNumber integer not null,
    userName varchar(20) not null,
    isApproved bit not null default 0,
    approvalAmount decimal(10, 2) not null default 0,
    lastUpdatedDate integer not null,
    lastUpdatedTime integer not null,
    primary key (tenant, orderNumber, userName),
    foreign key (tenant, orderNumber) references PurchaseOrders (tenant, orderNumber))`
]

export function initializePurchaseOrderApprovalsDatabase(): boolean {
  let success = false

  const database = sqlite(databasePath)

  const row = database
    .prepare(
      // eslint-disable-next-line no-secrets/no-secrets
      `select name from sqlite_master
        where type = 'table'
        and name = 'Approvals'`
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
