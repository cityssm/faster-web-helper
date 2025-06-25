import sqlite from 'better-sqlite3'

import { databasePath } from '../helpers/database.helpers.js'
import type { WorkOrderType } from '../types.js'

export default function getMaxWorkOrderValidationRecordUpdateMillis(
  workOrderType?: WorkOrderType
): number {
  const database = sqlite(databasePath, {
    readonly: true
  })

  let sql = `select max(recordUpdate_timeMillis)
    from WorkOrderValidationRecords
    where recordDelete_timeMillis is null`

  const sqlParameters: string[] = []

  if (workOrderType !== undefined) {
    sql += ' and workOrderType = ?'
    sqlParameters.push(workOrderType)
  }

  const result = database.prepare(sql).pluck().get(sqlParameters) as
    | number
    | undefined

  database.close()

  return result ?? 0
}
