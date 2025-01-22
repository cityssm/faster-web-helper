import type sqlite from 'better-sqlite3'

import type { IntegrityWorktechEquipment } from '../types.js'

export function createOrUpdateWorktechEquipment(
  worktechEquipment: IntegrityWorktechEquipment,
  connectedDatabase: sqlite.Database
): boolean {
  const sql = `insert or replace into WorktechEquipment (
      equipmentSystemId, equipmentId,
      vinSerial,
      license,
      year, make, model,
      recordUpdate_timeMillis
    ) 
    values (?, ?, ?, ?, ?, ?, ?, ?)`

  const statement = connectedDatabase.prepare(sql)

  const success = statement.run(
    worktechEquipment.equipmentSystemId,
    worktechEquipment.equipmentId,
    worktechEquipment.vinSerial,
    worktechEquipment.license,
    worktechEquipment.year,
    worktechEquipment.make,
    worktechEquipment.model,
    worktechEquipment.recordUpdate_timeMillis
  )

  return success.changes > 0
}
