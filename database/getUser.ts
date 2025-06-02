import sqlite from 'better-sqlite3'

import { getUserSettings } from './getUserSettings.js'
import { databasePath } from './helpers.userDatabase.js'

function getUserByField(
  userDataField: 'userKeyGuid' | 'userName',
  userDataValue: string
): FasterWebHelperSessionUser | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const user = database
    .prepare(
      `select userName, fasterWebUserName, emailAddress, userKeyGuid
        from Users
        where recordDelete_timeMillis is null
        and ${userDataField} = ?`
    )
    .get(userDataValue) as FasterWebHelperSessionUser | undefined

  if (user !== undefined) {
    user.settings = getUserSettings(user.userName, database)
  }

  database.close()

  return user
}

export function getUserByUserName(
  userName: string
): FasterWebHelperSessionUser | undefined {
  return getUserByField('userName', userName)
}

export function getUserByUserKeyGuid(
  userKeyGuid: string
): FasterWebHelperSessionUser | undefined {
  return getUserByField('userKeyGuid', userKeyGuid)
}
