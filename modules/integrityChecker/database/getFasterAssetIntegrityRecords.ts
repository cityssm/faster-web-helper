import sqlite from 'better-sqlite3'

import type { FasterAssetIntegrityRecord } from '../types.js'

import { databasePath } from './helpers.database.js'

export default function getFasterAssetIntegrityRecords(): FasterAssetIntegrityRecord[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select f.assetNumber, f.organization,
        f.vinSerial, f.vinSerialIsValid,
        f.license,
        f.year, f.make, f.model,
        f.recordUpdate_timeMillis,
        n.suggestedVin as nhtsaSuggestedVin,
        n.make as nhtsaMake,
        n.model as nhtsaModel,
        n.year as nhtsaYear,
        n.errorCode as nhtsaErrorCode,
        n.errorText as nhtsaErrorText,
        n.recordUpdate_timeMillis as nhtsaRecordUpdate_timeMillis
        from FasterAssets f
        left join NhtsaVehicles n on f.vinSerial = n.vin
        order by f.assetNumber`
    )
    .all() as FasterAssetIntegrityRecord[]

  database.close()

  return result
}
