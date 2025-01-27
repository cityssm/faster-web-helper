import sqlite from 'better-sqlite3'

import type { WorktechEquipmentIntegrityRecord } from '../types.js'

import { databasePath } from './helpers.database.js'

export default function getWorktechEquipmentIntegrityRecords(): WorktechEquipmentIntegrityRecord[] {
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
        w.equipmentSystemId as worktechEquipmentSystemId,
        w.equipmentId as worktechEquipmentId,
        w.vinSerial as worktechVinSerial,
        w.license as worktechLicense,
        w.year as worktechYear,
        w.make as worktechMake,
        w.model as worktechModel,
        w.recordUpdate_timeMillis as worktechRecordUpdate_timeMillis
        from FasterAssets f
        left join WorktechEquipment w on f.assetNumber = w.equipmentId
        order by f.assetNumber`
    )
    .all() as WorktechEquipmentIntegrityRecord[]

  database.close()

  return result
}
