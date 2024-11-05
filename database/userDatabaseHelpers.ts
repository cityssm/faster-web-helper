import sqlite from 'better-sqlite3'
import Debug from 'debug'

const debug = Debug(`faster-web-helper:userDatabaseHelpers`)

export const databasePath = 'data/users.db'

const createStatements = [
  `create table if not exists Users (
    userName varchar(20) primary key not null,
    fasterWebUserName varchar(20),
    emailAddress varchar(100),
    userKeyGuid char(32) not null unique,
    recordCreate_userName varchar(20) not null,
    recordCreate_timeMillis integer not null,
    recordUpdate_userName varchar(20) not null,
    recordUpdate_timeMillis integer not null,
    recordDelete_userName varchar(20),
    recordDelete_timeMillis integer)`,

  `create table if not exists UserSettings (
    userName varchar(20) not null,
    propertyName varchar(100) not null,
    propertyValue varchar(500) not null default '',
    primary key (userName, propertyName),
    foreign key (userName) references Users (userName))`
]

export function initializeUserDatabase(): boolean {
  let success = false

  const database = sqlite(databasePath)

  const row = database
    .prepare(
      `select name from sqlite_master
        where type = 'table'
        and name = 'UserSettings'`
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
