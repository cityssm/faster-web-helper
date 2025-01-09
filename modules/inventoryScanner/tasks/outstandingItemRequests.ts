import { FasterApi } from '@cityssm/faster-api'
import FasterUrlBuilder from '@cityssm/faster-url-builder'
import ntfyPublish from '@cityssm/ntfy-publish'
import { minutesToMillis } from '@cityssm/to-millis'
import camelcase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { getConfigProperty } from '../../../helpers/config.functions.js'
import { getSettingValues } from '../database/getSetting.js'
import updateSetting from '../database/updateSetting.js'
import { summarizeItemRequests } from '../helpers/faster.functions.js'
import { moduleName } from '../helpers/module.helpers.js'

const minimumMillisBetweenRuns = minutesToMillis(2)

let lastRunMillis = 0

export const taskName = 'Outstanding Item Requests - FASTER API'

const debug = Debug(
  `faster-web-helper:${camelcase(moduleName)}:${camelcase(taskName)}`
)

const fasterWebConfig = getConfigProperty('fasterWeb')

const fasterUrlBuilder = new FasterUrlBuilder(fasterWebConfig.tenantOrBaseUrl)

const ntfyTopic = getConfigProperty(
  'modules.inventoryScanner.fasterItemRequests.ntfy.topic'
)

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

  const summarizedItemRequests = summarizeItemRequests(itemRequestsResponse)

  updateSetting(
    'itemRequests.count',
    summarizedItemRequests.itemRequestsCount.toString()
  )

  updateSetting(
    'itemRequests.maxItemRequestId',
    summarizedItemRequests.maxItemRequestId.toString()
  )

  if (
    getConfigProperty(
      'modules.inventoryScanner.fasterItemRequests.ntfy.isEnabled'
    ) &&
    ntfyTopic !== undefined
  ) {
    const itemRequestCountValues = getSettingValues('itemRequests.count')
    const maxItemRequestIdValues = getSettingValues(
      'itemRequests.maxItemRequestId'
    )

    if (
      (itemRequestCountValues !== undefined &&
        Number.parseInt(itemRequestCountValues.previousSettingValue ?? '0') <
          Number.parseInt(itemRequestCountValues.settingValue ?? '0')) ||
      (maxItemRequestIdValues !== undefined &&
        Number.parseInt(maxItemRequestIdValues.previousSettingValue ?? '0') <
          Number.parseInt(maxItemRequestIdValues.settingValue ?? '0'))
    ) {
      await ntfyPublish({
        topic: ntfyTopic,
        title: 'FASTER Web Helper',
        message: 'New item requests have been received.',
        clickURL: fasterUrlBuilder.inventoryItemRequestSearchUrl
      })
    }
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
