import { FasterApi } from '@cityssm/faster-api'
import { minutesToMillis } from '@cityssm/to-millis'
import camelcase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { getConfigProperty } from '../../../helpers/config.functions.js'
import getSetting from '../database/getSetting.js'
import updateSetting from '../database/updateSetting.js'
import { moduleName } from '../helpers/module.js'

const minimumMillisBetweenRuns = minutesToMillis(2)

let lastRunMillis = 0
let itemRequestsCount = Number.parseInt(
  getSetting('itemRequests.count') ?? '-1'
)

export const taskName = 'Outstanding Item Requests - FASTER API'

const debug = Debug(
  `faster-web-helper:${camelcase(moduleName)}:${camelcase(taskName)}`
)

const fasterWebConfig = getConfigProperty('fasterWeb')

async function runOutstandingItemRequestsFromFasterApiTask(): Promise<void> {
  if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
    debug('Skipping run.')
    return
  }

  if (
    fasterWebConfig.apiUserName === undefined ||
    fasterWebConfig.apiPassword === undefined
  ) {
    debug('Missing API user configuration.')
    return
  }

  debug(`Running "${taskName}"...`)

  const timeMillis = Date.now()
  lastRunMillis = timeMillis

  const fasterApi = new FasterApi(
    fasterWebConfig.tenantOrBaseUrl,
    fasterWebConfig.apiUserName,
    fasterWebConfig.apiPassword
  )

  debug('Querying the FASTER API...')
  const itemRequestsResponse = await fasterApi.getItemRequests({})

  if (!itemRequestsResponse.success) {
    debug(`FASTER API error: ${JSON.stringify(itemRequestsResponse.error)}`)
    return
  }

  if (itemRequestsResponse.response.success !== itemRequestsCount) {
    itemRequestsCount = itemRequestsResponse.response.success

    updateSetting(
      'itemRequests.count',
      itemRequestsResponse.response.success.toString()
    )
  }

  debug(`Finished "${taskName}".`)
}

await runOutstandingItemRequestsFromFasterApiTask()

const job = schedule.scheduleJob(
  taskName,
  {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: new schedule.Range(2, 60, 5),
    second: 0
  },
  runOutstandingItemRequestsFromFasterApiTask
)

exitHook(() => {
  try {
    job.cancel()
  } catch {
    // ignore
  }
})
