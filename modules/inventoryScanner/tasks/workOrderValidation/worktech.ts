// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */

import { minutesToMillis } from '@cityssm/to-millis'
import { WorkTechAPI } from '@cityssm/worktech-api'
import camelcase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { getConfigProperty } from '../../../../helpers/functions.config.js'
import { getScheduledTaskMinutes } from '../../../../helpers/functions.task.js'
import createOrUpdateWorkOrderValidation from '../../database/createOrUpdateWorkOrderValidation.js'
import getMaxWorkOrderValidationRecordUpdateMillis from '../../database/getMaxWorkOrderValidationRecordUpdateMillis.js'
import getScannerRecords from '../../database/getScannerRecords.js'
import { moduleName } from '../../helpers/module.js'

const minimumMillisBetweenRuns = minutesToMillis(20)
let lastRunMillis = getMaxWorkOrderValidationRecordUpdateMillis('worktech')

export const taskName = 'Work Order Validation Task - Worktech'

const debug = Debug(
  `faster-web-helper:${camelcase(moduleName)}:${camelcase(taskName)}`
)

const worktechConfig = getConfigProperty('worktech')

async function runUpdateWorkOrderValidationFromWorktechTask(): Promise<void> {
  if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
    debug('Skipping run.')
    return
  }

  if (
    worktechConfig === undefined
  ) {
    debug('Missing Worktech configuration.')
    return
  }

  debug(`Running "${taskName}"...`)

  const timeMillis = Date.now()
  lastRunMillis = timeMillis

  const worktech = new WorkTechAPI(worktechConfig)

  const scannerRecords = getScannerRecords({
    isSynced: false,
    workOrderType: 'worktech'
  })

  for (const scannerRecord of scannerRecords) {
    const workOrder = await worktech.getWorkOrderByWorkOrderNumber(scannerRecord.workOrderNumber)

    if (workOrder !== undefined) {
      createOrUpdateWorkOrderValidation(
        {
          workOrderNumber: workOrder.workOrderNumber,
          workOrderType: 'worktech',
          workOrderDescription: workOrder.details,
          repairId: null,
          repairDescription: null,
          technicianDescription: workOrder.assignedTo
        },
        timeMillis
      )
    }
  }

  debug(`Finished "${taskName}".`)
}

await runUpdateWorkOrderValidationFromWorktechTask()

const job = schedule.scheduleJob(
  taskName,
  {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('inventoryScanner.workOrderValidation.worktech'),
    second: 0
  },
  runUpdateWorkOrderValidationFromWorktechTask
)

exitHook(() => {
  try {
    job.cancel()
  } catch {
    // ignore
  }
})
