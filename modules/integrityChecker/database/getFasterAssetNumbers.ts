import sqlite from 'better-sqlite3'

import { databasePath } from './helpers.database.js'

export default function getFasterAssetNumbers(): string[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare('select assetNumber from FasterAssets')
    .pluck()
    .all() as string[]

  database.close()

  return result
}
