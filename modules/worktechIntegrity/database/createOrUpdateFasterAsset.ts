import type sqlite from 'better-sqlite3'

import type { IntegrityFasterAsset } from '../types.js'

export function createOrUpdateFasterAsset(
  fasterAsset: IntegrityFasterAsset,
  connectedDatabase: sqlite.Database
): boolean {
  const sql = `insert or replace into FasterAssets (
      assetNumber, organization,
      vinSerial, vinSerialIsValid,
      license,
      year, make, model,
      recordUpdate_timeMillis
    ) 
    values (?, ?, ?, ?, ?, ?, ?, ?, ?)`

  const statement = connectedDatabase.prepare(sql)

  const success = statement.run(
    fasterAsset.assetNumber,
    fasterAsset.organization,
    fasterAsset.vinSerial,
    fasterAsset.vinSerialIsValid,
    fasterAsset.license,
    fasterAsset.year,
    fasterAsset.make,
    fasterAsset.model,
    fasterAsset.recordUpdate_timeMillis
  )

  return success.changes > 0
}
