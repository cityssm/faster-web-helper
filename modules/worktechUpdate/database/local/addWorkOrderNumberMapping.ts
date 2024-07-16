import sqlite from 'better-sqlite3'

import { databasePath } from './databaseHelpers.js'

export default function addWorkOrderNumberMapping(workOrderNumberMapping: {
  documentNumber: string | number
  workOrderNumber: string
  exportDate: number
  exportTime: number
}): boolean {
  const database = sqlite(databasePath)

  const results = database
    .prepare(
      `insert into WorkOrderNumberMappings
        (documentNumber, workOrderNumber, exportDate, exportTime)
        values (?, ?, ?, ?)`
    )
    .run(
      workOrderNumberMapping.documentNumber,
      workOrderNumberMapping.workOrderNumber,
      workOrderNumberMapping.exportDate,
      workOrderNumberMapping.exportTime
    )

  database.close()

  return results.changes > 0
}
