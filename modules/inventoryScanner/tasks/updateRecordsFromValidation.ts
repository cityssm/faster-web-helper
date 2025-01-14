import { minutesToMillis } from '@cityssm/to-millis'
import camelcase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { DEBUG_NAMESPACE } from '../../../debug.config.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js'
import { getItemValidationRecordsByItemNumber } from '../database/getItemValidationRecords.js'
import getScannerRecords from '../database/getScannerRecords.js'
import getWorkOrderValidationRecords from '../database/getWorkOrderValidationRecords.js'
import { updateScannerRecordField } from '../database/updateScannerRecordField.js'
import { moduleName } from '../helpers/module.helpers.js'

const minimumMillisBetweenRuns = minutesToMillis(2)
const lastRunMillis = 0

export const taskName = 'Update Records from Validation Task'
export const taskUserName = 'validationTask'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`
)

function updateRecordsFromValidationTask(): void {
  if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
    debug('Skipping run.')
    return
  }

  debug(`Running "${taskName}"...`)

  const unvalidatedRecords = getScannerRecords({
    isSynced: false,
    hasMissingValidation: true
  })

  for (const record of unvalidatedRecords) {
    const workOrderValidationRecords =
      record.repairId === null || record.repairDescription === null
        ? getWorkOrderValidationRecords(
            record.workOrderNumber,
            record.workOrderType
          )
        : []

    if (workOrderValidationRecords.length > 0 && record.repairId === null) {
      for (const workOrderValidationRecord of workOrderValidationRecords) {
        if (workOrderValidationRecord.repairId !== null) {
          updateScannerRecordField(
            record.recordId,
            'repairId',
            workOrderValidationRecord.repairId,
            taskUserName
          )
          break
        }
      }
    }

    const itemValidationRecords =
      record.itemStoreroom === null || record.unitPrice === null
        ? getItemValidationRecordsByItemNumber(record.itemNumber)
        : []

    if (itemValidationRecords.length > 0) {
      if (record.itemStoreroom === null) {
        updateScannerRecordField(
          record.recordId,
          'itemStoreroom',
          itemValidationRecords[0].itemStoreroom,
          taskUserName
        )
      }

      if (record.unitPrice === null) {
        updateScannerRecordField(
          record.recordId,
          'unitPrice',
          itemValidationRecords[0].unitPrice,
          taskUserName
        )
      }
    }
  }

  debug(`Finished "${taskName}".`)
}

updateRecordsFromValidationTask()

const job = schedule.scheduleJob(
  taskName,
  {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: new schedule.Range(0, 55, 5),
    second: 0
  },
  updateRecordsFromValidationTask
)

exitHook(() => {
  try {
    job.cancel()
  } catch {
    // ignore
  }
})
