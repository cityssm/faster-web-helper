import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'
import type { WorkOrderType } from '../types.js'

export default function getUnsyncedWorkOrderNumbersAndRepairIds(
  workOrderType: WorkOrderType = 'faster'
): {
  workOrderNumbers: string[]
  repairIds: number[]
} {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const records = database
    .prepare(
      `select workOrderNumber, repairId from InventoryScannerRecords
        where recordSync_timeMillis is null
        and recordDelete_timeMillis is null
        and workOrderType = ?`
    )
    .all(workOrderType) as Array<{
    workOrderNumber: string
    repairId: number | null
  }>

  database.close()

  const workOrderNumberSet = new Set<string>()
  const repairIdSet = new Set<number>()

  for (const record of records) {
    workOrderNumberSet.add(record.workOrderNumber)

    if (record.repairId !== null) {
      repairIdSet.add(record.repairId)
    }
  }

  return {
    workOrderNumbers: [...workOrderNumberSet.values()],
    repairIds: [...repairIdSet.values()]
  }
}
