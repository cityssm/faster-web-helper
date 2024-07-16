import sqlite from 'better-sqlite3'

import type { WorkOrderNumberMapping } from '../../worktechUpdateTypes.js'

import { databasePath } from './databaseHelpers.js'

export default function getWorkOrderNumberMapping(
  documentNumber: string | number
): WorkOrderNumberMapping | undefined {
  const database = sqlite(databasePath)

  const row = database
    .prepare(
      `select documentNumber, workOrderNumber, exportDate, exportTime
        from WorkOrderNumberMappings
        where documentNumber = ?`
    )
    .get(documentNumber) as WorkOrderNumberMapping | undefined

  database.close()

  return row
}
