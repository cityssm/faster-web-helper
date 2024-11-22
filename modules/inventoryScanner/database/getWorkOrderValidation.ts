import sqlite from 'better-sqlite3'

import type { WorkOrderType, WorkOrderValidationRecord } from '../types.js'

import { databasePath } from './helpers.database.js'

export default function getWorkOrderValidation(
  validationRecord: {
    workOrderNumber: string
    workOrderType: WorkOrderType
    repairId?: number
  },
  includeDeleted: boolean,
  connectedDatabase?: sqlite.Database
): WorkOrderValidationRecord | undefined {
  const database =
    connectedDatabase ??
    sqlite(databasePath, {
      readonly: true
    })

  const sqlParameters: unknown[] = [
    validationRecord.workOrderNumber,
    validationRecord.workOrderType
  ]

  if (validationRecord.repairId !== undefined) {
    sqlParameters.push(validationRecord.repairId)
  }

  const result = database
    .prepare(
      `select workOrderNumber, workOrderType, workOrderDescription,
        technicianId, technicianDescription,
        repairId, repairDescription
        from WorkOrderValidationRecords
        where workOrderNumber = ?
        and workOrderType = ?
        ${validationRecord.repairId === undefined ? ' and repairId is null' : ' and repairId = ?'}
        ${includeDeleted ? '' : ' and recordDelete_timeMillis is not null'}`
    )
    .get(sqlParameters) as WorkOrderValidationRecord | undefined

  if (connectedDatabase === undefined) {
    database.close()
  }

  return result
}
