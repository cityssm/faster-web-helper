// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */

import { ScheduledTask } from '@cityssm/scheduled-task'
import { WorkTechAPI } from '@cityssm/worktech-api'
import camelcase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../../../debug.config.js'
import { getConfigProperty } from '../../../../helpers/config.helpers.js'
import {
  getMinimumMillisBetweenRuns,
  getScheduledTaskMinutes
} from '../../../../helpers/tasks.helpers.js'
import type { TaskWorkerMessage } from '../../../../types/tasks.types.js'
import createOrUpdateWorkOrderValidation from '../../database/createOrUpdateWorkOrderValidation.js'
import getMaxWorkOrderValidationRecordUpdateMillis from '../../database/getMaxWorkOrderValidationRecordUpdateMillis.js'
import getScannerRecords from '../../database/getScannerRecords.js'
import { moduleName } from '../../helpers/module.helpers.js'

export const taskName = 'Work Order Validation Task - Worktech'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`
)

const worktechConfig = getConfigProperty('worktech')

async function updateWorkOrderValidationFromWorktech(): Promise<void> {
  if (worktechConfig === undefined) {
    debug('Missing Worktech configuration.')
    return
  }

  const timeMillis = Date.now()

  const worktech = new WorkTechAPI(worktechConfig)

  const scannerRecords = getScannerRecords({
    isSynced: false,
    workOrderType: 'worktech'
  })

  for (const scannerRecord of scannerRecords) {
    const workOrder = await worktech.getWorkOrderByWorkOrderNumber(
      scannerRecord.workOrderNumber
    )

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
}

const scheduledTask = new ScheduledTask(
  taskName,
  updateWorkOrderValidationFromWorktech,
  {
    schedule: {
      dayOfWeek: getConfigProperty('application.workDays'),
      hour: getConfigProperty('application.workHours'),
      minute: getScheduledTaskMinutes(
        'inventoryScanner_workOrderValidation_worktech'
      ),
      second: 0
    },
    lastRunMillis: getMaxWorkOrderValidationRecordUpdateMillis('worktech'),
    minimumIntervalMillis: getMinimumMillisBetweenRuns(
      'inventoryScanner_workOrderValidation_worktech'
    ),
    startTask: true
  }
)

/*
 * Listen for messages
 */

process.on('message', (_message: TaskWorkerMessage) => {
  void scheduledTask.runTask()
})

/*
 * Run the task on initialization
 */

void scheduledTask.runTask()
