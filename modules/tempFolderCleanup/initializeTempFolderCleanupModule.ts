import { dateToString, dateToTimePeriodString } from '@cityssm/utils-datetime'
import camelCase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { getConfigProperty } from '../../helpers/functions.config.js'
import type { ModuleInitializerOptions } from '../types.js'

import { moduleName } from './helpers/moduleHelpers.js'
import runTempFolderCleanupTask, {
  taskName as tempFolderCleanupTaskName
} from './tasks/tempFolderCleanupTask.js'

const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`)

export default async function initializeTempFolderCleanupModule(
  options?: ModuleInitializerOptions
): Promise<void> {
  debug(`Initializing "${moduleName}"...`)

  if (getConfigProperty('modules.tempFolderCleanup.runOnStartup')) {
    debug(`Running "${tempFolderCleanupTaskName}" on startup...`)
    await runTempFolderCleanupTask()
  }

  const tempFolderCleanupJob = schedule.scheduleJob(
    tempFolderCleanupTaskName,
    getConfigProperty('modules.tempFolderCleanup.schedule'),
    runTempFolderCleanupTask
  )

  const tempFolderCleanupFirstRunDate = new Date(
    tempFolderCleanupJob.nextInvocation().getTime()
  )

  debug(
    `Scheduled to run "${tempFolderCleanupTaskName}" on ${dateToString(tempFolderCleanupFirstRunDate)} at ${dateToTimePeriodString(tempFolderCleanupFirstRunDate)}`
  )

  /*
   * Set up exit hook
   */

  exitHook(() => {
    tempFolderCleanupJob.cancel()
  })

  debug(`"${moduleName}" initialized.`)
}
