import sqlite from 'better-sqlite3'

import { databasePath } from './helpers.database.js'

export default function getMaxFasterAssetUpdateMillis(): number {
  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `select max(recordUpdate_timeMillis)
        from FasterAssets`
    )
    .pluck()
    .get() as number | undefined

  database.close()

  return result ?? 0
}
