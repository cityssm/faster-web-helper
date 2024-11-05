import sqlite from 'better-sqlite3'

import { databasePath } from './userDatabaseHelpers.js'

function getUserByField(
  userDataField: 'userName' | 'userKeyGuid',
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
    user.settings = {}

    const userSettings = database
      .prepare(
        `select propertyName, propertyValue
          from UserSettings
          where userName = ?`
      )
      .all(user.userName) as Array<{
      propertyName: string
      propertyValue: string
    }>

    for (const setting of userSettings) {
      user.settings[setting.propertyName] = setting.propertyValue
    }
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
