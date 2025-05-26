import { FasterApi } from '@cityssm/faster-api'
import { ScheduledTask } from '@cityssm/scheduled-task'
import camelcase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../../../debug.config.js'
import { getConfigProperty } from '../../../../helpers/config.helpers.js'
import {
  getMinimumMillisBetweenRuns,
  getScheduledTaskMinutes
} from '../../../../helpers/tasks.helpers.js'
import createOrUpdateWorkOrderValidation from '../../database/createOrUpdateWorkOrderValidation.js'
import deleteWorkOrderValidation from '../../database/deleteWorkOrderValidation.js'
import getMaxWorkOrderValidationRecordUpdateMillis from '../../database/getMaxWorkOrderValidationRecordUpdateMillis.js'
import { getRepairIdsToRefresh } from '../../helpers/faster.helpers.js'
import { moduleName } from '../../helpers/module.helpers.js'

export const taskName = 'Work Order Validation - FASTER API'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`
)

const fasterWebConfig = getConfigProperty('fasterWeb')

async function updateWorkOrderValidationFromFasterApi(): Promise<void> {
  if (
    fasterWebConfig.apiUserName === undefined ||
    fasterWebConfig.apiPassword === undefined
  ) {
    debug('Missing API user configuration.')
    return
  }

  const timeMillis = Date.now()

  const fasterApi = new FasterApi(
    fasterWebConfig.tenantOrBaseUrl,
    fasterWebConfig.apiUserName,
    fasterWebConfig.apiPassword
  )

  const repairIdsToRefresh = getRepairIdsToRefresh()

  debug(`Querying ${repairIdsToRefresh.length} repairs from the FASTER API...`)

  try {
    const repairResponse = await fasterApi.getRepairs(repairIdsToRefresh)

    if (!repairResponse.success) {
      debug(`FASTER API error: ${JSON.stringify(repairResponse.error)}`)
      return
    }

    for (const repair of repairResponse.response.results) {
      if (repair.documentID === 0) {
        deleteWorkOrderValidation(repair.repairID, 'faster')
      } else {
        createOrUpdateWorkOrderValidation(
          {
            workOrderNumber: repair.documentID.toString(),
            workOrderType: 'faster',
            workOrderDescription: repair.groupComponentAction,
            repairId: repair.repairID,
            repairDescription: repair.repairDesc,
            technicianId: undefined,
            technicianDescription: repair.technicianName
          },
          timeMillis
        )
      }
    }
  } catch (error) {
    debug(`FASTER API error: ${error}`)
  }
}

// eslint-disable-next-line no-secrets/no-secrets
const programTaskName = 'inventoryScanner_workOrderValidation_fasterApi'

const scheduledTask = new ScheduledTask(
  taskName,
  updateWorkOrderValidationFromFasterApi,
  {
    schedule: {
      dayOfWeek: getConfigProperty('application.workDays'),
      hour: getConfigProperty('application.workHours'),
      minute: getScheduledTaskMinutes(programTaskName),
      second: 0
    },
    lastRunMillis: getMaxWorkOrderValidationRecordUpdateMillis('faster'),
    minimumIntervalMillis: getMinimumMillisBetweenRuns(programTaskName),
    startTask: true
  }
)

/*
 * Listen for messages
 */

process.on('message', (_message: unknown) => {
  debug('Received message.')
  void scheduledTask.runTask()
})

/*
 * Run the task on initialization
 */

await scheduledTask.runTask()
