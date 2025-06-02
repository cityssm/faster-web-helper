import type sqlite from 'better-sqlite3'

import type { userSettingNames } from '../helpers/userSettings.helpers.js'

export function getUserSettings(
  userName: string,
  connectedDatabase: sqlite.Database
): Partial<Record<(typeof userSettingNames)[number], string | null>> {
  const userSettingsList = connectedDatabase
    .prepare(
      `select propertyName, propertyValue
        from UserSettings
        where userName = ?`
    )
    .all(userName) as Array<{
    propertyName: (typeof userSettingNames)[number]
    propertyValue: string | null
  }>

  const userSettings: Partial<
    Record<(typeof userSettingNames)[number], string | null>
  > = {}

  for (const setting of userSettingsList) {
    userSettings[setting.propertyName] = setting.propertyValue
  }

  return userSettings
}
