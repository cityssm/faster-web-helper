import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'
import type { WorkOrderType } from '../types.js'

export default function getWorkOrderValidationRepairIds(
  workOrderNumbers: string[],
  workOrderType: WorkOrderType = 'faster'
): Array<{ repairId: number }> {
  const workOrderWhereClause: string[] = []
  const sqlParameters: string[] = [workOrderType]

  for (const workOrderNumber of workOrderNumbers) {
    workOrderWhereClause.push('workOrderNumber = ?')
    sqlParameters.push(workOrderNumber)
  }

  const database = sqlite(databasePath, {
    readonly: true
  })

  const result = database
    .prepare(
      `select repairId
        from WorkOrderValidationRecords
        where recordDelete_timeMillis is null
          and repairId is not null
          and workOrderType = ?
          and (${workOrderWhereClause.join(' or ')})`
    )
    .all(sqlParameters) as Array<{ repairId: number }>

  database.close()

  return result
}
