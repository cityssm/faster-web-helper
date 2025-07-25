import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'
import type { WorkOrderType, WorkOrderValidationRecord } from '../types.js'

export default function getWorkOrderValidationRecords(
  workOrderNumber: string,
  workOrderType: WorkOrderType
): WorkOrderValidationRecord[] {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select workOrderNumber, workOrderType, workOrderDescription,
        technicianId, technicianDescription,
        repairId, repairDescription
        from WorkOrderValidationRecords
        where recordDelete_timeMillis is null
          and workOrderNumber = ?
          and workOrderType = ?`
    )
    .all(workOrderNumber, workOrderType) as WorkOrderValidationRecord[]

  database.close()

  return result
}
