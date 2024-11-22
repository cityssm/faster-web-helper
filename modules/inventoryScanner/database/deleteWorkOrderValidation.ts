import sqlite from 'better-sqlite3'

import type { WorkOrderType } from '../types.js'

import { databasePath } from './helpers.database.js'

const primaryKeyColumn =
  "ifnull(repairId, '') || '::' || workOrderType || '::' || workOrderNumber"

export default function deleteWorkOrderValidation(
  repairId: number,
  workOrderType: WorkOrderType = 'faster'
): void {
  const database = sqlite(databasePath)

  const result = database
    .prepare(
      `update WorkOrderValidationRecords
        set recordDelete_timeMillis = ?
        where recordDelete_timeMillis is null
        and repairId = ?
        and workOrderType = ?`
    )
    .run(Date.now(), repairId, workOrderType)

  if (result.changes > 0) {
    database
      .prepare(
        `delete from WorkOrderValidationRecords
          where recordDelete_timeMillis is not null
          and ${primaryKeyColumn} not in (select ${primaryKeyColumn} from InventoryScannerRecords)`
      )
      .run()
  }

  database.close()
}
