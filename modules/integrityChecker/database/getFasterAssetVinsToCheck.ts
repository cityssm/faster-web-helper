import sqlite from 'better-sqlite3'

import { databasePath } from './helpers.database.js'

interface VinToCheck {
  vinSerial: string
  year: number
}

export default function getFasterAssetVinsToCheck(): VinToCheck[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select vinSerial, year from FasterAssets
        where vinSerialIsValid = 1
        and vinSerial not in (select vin from NhtsaVehicles)`
    )
    .all() as VinToCheck[]

  database.close()

  return result
}
