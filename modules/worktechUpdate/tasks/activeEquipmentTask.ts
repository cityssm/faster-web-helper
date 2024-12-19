import { FasterApi } from '@cityssm/faster-api'
import type { mssqlTypes } from '@cityssm/mssql-multi-pool'
import { WorkTechAPI } from '@cityssm/worktech-api'
import camelCase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { getConfigProperty } from '../../../helpers/functions.config.js'
import { getScheduledTaskMinutes } from '../../../helpers/functions.task.js'
import { moduleName } from '../helpers/moduleHelpers.js'

export const taskName = 'Active Equipment Task'

const debug = Debug(`faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`)

const fasterWebConfig = getConfigProperty('fasterWeb')

const worktech = new WorkTechAPI(getConfigProperty('worktech') as mssqlTypes.config)

async function runActiveEquipmentTask(): Promise<void> {

  if (
    fasterWebConfig.apiUserName === undefined ||
    fasterWebConfig.apiPassword === undefined
  ) {
    debug('Missing API user configuration.')
    return
  }

  debug(`Running "${taskName}"...`)

  /*
   * Call FASTER API
   */

  const fasterApi = new FasterApi(fasterWebConfig.tenantOrBaseUrl,
    fasterWebConfig.apiUserName,
    fasterWebConfig.apiPassword
  )

  // const assets = await fasterApi.getAssetsByLastModifiedDate()

  /*
  for (const fasterEquipment of report.data) {
    const worktechEquipment = await worktech.getEquipmentByEquipmentId(fasterEquipment.assetNumber)

    if (worktechEquipment === undefined) {
      // add equipment
    }
  }
  */
  
}

await runActiveEquipmentTask()

const job = schedule.scheduleJob(
  taskName,
  {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('worktechUpdate.activeEquipment'),
    second: 0
  },
  runActiveEquipmentTask
)

exitHook(() => {
  try {
    job.cancel()
  } catch {
    // ignore
  }
})
