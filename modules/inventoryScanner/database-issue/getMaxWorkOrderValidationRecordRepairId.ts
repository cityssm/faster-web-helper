import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'
import type { WorkOrderType } from '../types.js'

export default function getMaxWorkOrderValidationRepairId(
  workOrderType: WorkOrderType = 'faster'
): number {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select max(repairId)
        from WorkOrderValidationRecords
        where workOrderType = ?
          and repairId is not null`
    )
    .pluck()
    .get(workOrderType) as number | undefined

  database.close()

  return result ?? 0
}
