import path from 'node:path'

import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime'
import camelCase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import express from 'express'
import schedule from 'node-schedule'

import { getConfigProperty } from '../../helpers/functions.config.js'

import { moduleName } from './helpers/moduleHelpers.js'
import runUpdateItemNumbersTask, {
  taskName as updateItemNumbersTaskName
} from './tasks/updateItemNumbersTask.js'

const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`)

const itemNumbersConfig = getConfigProperty('modules.autocomplete.reports.w200')

export default async function initializeAutocompleteModule(
  app: express.Express
): Promise<void> {
  debug(`Initializing "${moduleName}"...`)

  /*
   * Set up static server
   */

  app.use(
    getConfigProperty('webServer.urlPrefix') + '/autocomplete',
    express.static(path.join('public', 'autocomplete'))
  )

  /*
   * Run startup tasks
   */

  if (getConfigProperty('modules.autocomplete.runOnStartup')) {
    debug(`Running "${updateItemNumbersTaskName}" on startup...`)
    await runUpdateItemNumbersTask()
  }

  /*
   * Schedule Update Files Job
   */

  const updateItemNumbersJob = schedule.scheduleJob(
    updateItemNumbersTaskName,
    itemNumbersConfig.schedule,
    runUpdateItemNumbersTask
  )

  const updateItemNumbersFirstRunDate = new Date(
    updateItemNumbersJob.nextInvocation().getTime()
  )

  debug(
    `Scheduled to run "${updateItemNumbersTaskName}" on ${dateToString(updateItemNumbersFirstRunDate)} at ${dateToTimePeriodString(updateItemNumbersFirstRunDate)}`
  )

  /*
   * Set up exit hook
   */

  exitHook(() => {
    updateItemNumbersJob.cancel()
  })

  debug(`"${moduleName}" initialized.`)
}
