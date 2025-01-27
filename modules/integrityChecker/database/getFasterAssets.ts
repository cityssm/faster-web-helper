import sqlite from 'better-sqlite3'

import type { IntegrityFasterAsset } from '../types.js'

import { databasePath } from './helpers.database.js'

export default function getFasterAssets(): IntegrityFasterAsset[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select assetNumber, organization,
        vinSerial, vinSerialIsValid,
        license, year, make, model,
        recordUpdate_timeMillis
        from FasterAssets`
    )
    .all() as IntegrityFasterAsset[]

  database.close()

  return result
}
