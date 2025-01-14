import { FasterApi } from '@cityssm/faster-api'
import FasterUrlBuilder from '@cityssm/faster-url-builder'
import { minutesToMillis } from '@cityssm/to-millis'
import camelcase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { DEBUG_NAMESPACE } from '../../../debug.config.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js'
import { sendNtfyMessage } from '../../../helpers/ntfy.helpers.js'
import { getSettingValues } from '../database/getSetting.js'
import updateSetting from '../database/updateSetting.js'
import { summarizeItemRequests } from '../helpers/faster.helpers.js'
import { moduleName } from '../helpers/module.helpers.js'

const minimumMillisBetweenRuns = minutesToMillis(2)

let lastRunMillis = 0

export const taskName = 'Outstanding Item Requests - FASTER API'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`
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

  try {
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
        (getConfigProperty('ntfy.server') !== '' &&
          itemRequestCountValues !== undefined &&
          Number.parseInt(itemRequestCountValues.previousSettingValue ?? '0') <
            Number.parseInt(itemRequestCountValues.settingValue ?? '0')) ||
        (maxItemRequestIdValues !== undefined &&
          Number.parseInt(maxItemRequestIdValues.previousSettingValue ?? '0') <
            Number.parseInt(maxItemRequestIdValues.settingValue ?? '0'))
      ) {
        await sendNtfyMessage({
          topic: ntfyTopic,
          message: 'New item requests have been received.',
          clickURL: fasterUrlBuilder.inventoryItemRequestSearchUrl
        })
      }
    }
  } catch (error) {
    debug('FASTER API error:', error)
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
