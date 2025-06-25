import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'

export default function getWorkOrderValidationJsonData(
  workOrderNumber: string,
  workOrderType: string,
  repairId?: number
): object | undefined {
  const database = sqlite(databasePath, {
    readonly: true
  })

  const sqlParameters: unknown[] = [workOrderNumber, workOrderType]

  if (repairId !== undefined) {
    sqlParameters.push(repairId)
  }

  const result = database
    .prepare(
      `select rawJsonData
        from WorkOrderValidationRecords
        where recordDelete_timeMillis is null
          and workOrderNumber = ?
          and workOrderType = ?
          ${repairId === undefined ? ' and repairId is null' : ' and repairId = ?'}`
    )
    .pluck()
    .get(sqlParameters) as string | undefined

  database.close()

  return typeof result === 'string' ? (JSON.parse(result) as object) : undefined
}
