import type sqlite from 'better-sqlite3'

type RecordTable =
  | 'FasterAssets'
  | 'WorktechEquipment'
  | 'FasterInventoryItems'
  | 'DynamicsGpInventoryItems'

export function deleteExpiredRecords(
  recordTable: RecordTable,
  recordUpdateTimeMillis: number,
  connectedDatabase: sqlite.Database
): number {
  const changeCount = connectedDatabase
    .prepare(
      `delete from ${recordTable}
        where recordUpdate_timeMillis < ?`
    )
    .run(recordUpdateTimeMillis)

  return changeCount.changes
}
