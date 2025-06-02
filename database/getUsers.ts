import sqlite from 'better-sqlite3'

import { getUserSettings } from './getUserSettings.js'
import { databasePath } from './helpers.userDatabase.js'

export function getUsers(): FasterWebHelperSessionUser[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const users = database
    .prepare(
      `select userName, fasterWebUserName, emailAddress, userKeyGuid
        from Users
        where recordDelete_timeMillis is null
        order by userName`
    )
    .all() as FasterWebHelperSessionUser[]

  for (const user of users) {
    user.settings = getUserSettings(user.userName, database)
  }

  database.close()

  return users
}
