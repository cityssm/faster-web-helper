import path from 'node:path'

import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime'
import camelCase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import express from 'express'
import schedule from 'node-schedule'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'

import { moduleName } from './helpers/moduleHelpers.js'
import runUpdateAssetNumbersTask, {
  taskName as updateAssetNumbersTaskName
} from './tasks/updateAssetNumbersTask.js'
import runUpdateItemNumbersTask, {
  taskName as updateItemNumbersTaskName
} from './tasks/updateItemNumbersTask.js'

const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}`)

const assetNumbersConfig = getConfigProperty(
  'modules.autocomplete.reports.w114'
)
const itemNumbersConfig = getConfigProperty('modules.autocomplete.reports.w200')

export function initializeAutocompleteAppHandlers(app: express.Application): void {
  app.use(
    `${getConfigProperty('webServer.urlPrefix')}/autocomplete`,
    express.static(path.join('public', 'autocomplete'))
  )
}

export async function initializeAutocompleteTasks(
): Promise<void> {
  if (getConfigProperty('modules.autocomplete.runOnStartup')) {
    debug(`Running "${updateItemNumbersTaskName}" on startup...`)

    if (assetNumbersConfig !== undefined) {
      await runUpdateAssetNumbersTask()
    }

    if (itemNumbersConfig !== undefined) {
      await runUpdateItemNumbersTask()
    }
  }

  /*
   * Schedule Jobs
   */

  let updateAssetNumbersJob: schedule.Job | undefined

  if (assetNumbersConfig !== undefined) {
    updateAssetNumbersJob = schedule.scheduleJob(
      updateAssetNumbersTaskName,
      assetNumbersConfig.schedule,
      runUpdateAssetNumbersTask
    )

    const updateAssetNumbersFirstRunDate = new Date(
      updateAssetNumbersJob.nextInvocation()?.getTime() ?? 0
    )

    debug(
      `Scheduled to run "${updateAssetNumbersTaskName}" on ${dateToString(updateAssetNumbersFirstRunDate)} at ${dateToTimePeriodString(updateAssetNumbersFirstRunDate)}`
    )
  }

  let updateItemNumbersJob: schedule.Job | undefined

  if (itemNumbersConfig !== undefined) {
    updateItemNumbersJob = schedule.scheduleJob(
      updateItemNumbersTaskName,
      itemNumbersConfig.schedule,
      runUpdateItemNumbersTask
    )

    const updateItemNumbersFirstRunDate = new Date(
      updateItemNumbersJob.nextInvocation()?.getTime() ?? 0
    )

    debug(
      `Scheduled to run "${updateItemNumbersTaskName}" on ${dateToString(updateItemNumbersFirstRunDate)} at ${dateToTimePeriodString(updateItemNumbersFirstRunDate)}`
    )
  }

  /*
   * Set up exit hook
   */

  exitHook(() => {
    if (updateAssetNumbersJob !== undefined) {
      updateAssetNumbersJob.cancel()
    }

    if (updateItemNumbersJob !== undefined) {
      updateItemNumbersJob.cancel()
    }
  })
}
