import { type ChildProcess, fork } from 'node:child_process'

import camelcase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { hasFasterApi } from '../../helpers/fasterWeb.helpers.js'
import type { TaskName } from '../../types/tasks.types.js'

import updateSetting from './database/updateSetting.js'
import { initializeInventoryScannerDatabase } from './helpers/database.helpers.js'
import { moduleName } from './helpers/module.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:${camelcase(moduleName)}:tasks`)

export default function initializeInventoryScannerTasks(): Partial<
  Record<TaskName, ChildProcess>
> {
  debug(`Initializing "${moduleName}"...`)

  initializeInventoryScannerDatabase()

  /*
   * On Demand Task Resets
   */

  updateSetting('syncScannerRecords.isRunning', '0')

  /*
   * Child Processes
   */

  const childProcesses: Partial<Record<TaskName, ChildProcess>> = {}

  /*
   * Item Validation
   */

  const itemValidationConfig = getConfigProperty(
    'modules.inventoryScanner.items.validation'
  )

  if (itemValidationConfig !== undefined) {
    let itemValidationTaskPath = ''
    let itemValidationTaskName = ''

    if (itemValidationConfig.source === 'dynamicsGP') {
      itemValidationTaskPath =
        './modules/inventoryScanner/tasks/itemValidation/dynamicsGp.js'
      itemValidationTaskName =
        'inventoryScanner_itemValidation_dynamicsGp' satisfies TaskName
    } else {
      debug(`Item validation not implemented: ${itemValidationConfig.source}`)
    }

    if (itemValidationTaskPath !== '') {
      // eslint-disable-next-line security/detect-object-injection
      childProcesses[itemValidationTaskName] = fork(itemValidationTaskPath)
    }
  }

  /*
   * Work Order Validation
   */

  const workOrderValidationSources = getConfigProperty(
    'modules.inventoryScanner.workOrders.validationSources'
  )

  for (const workOrderValidationSource of workOrderValidationSources) {
    let workOrderValidationTaskPath = ''
    let workOrderValidationTaskName = ''

    switch (workOrderValidationSource) {
      case 'fasterApi': {
        if (hasFasterApi) {
          workOrderValidationTaskPath =
            './modules/inventoryScanner/tasks/workOrderValidation/fasterApi.js'
          workOrderValidationTaskName =
            // eslint-disable-next-line no-secrets/no-secrets
            'inventoryScanner_workOrderValidation_fasterApi' satisfies TaskName
        } else {
          debug(
            'Optional "@cityssm/faster-api" package is required for work order validation by FASTER API.'
          )
        }
        break
      }
      case 'worktech': {
        workOrderValidationTaskPath =
          './modules/inventoryScanner/tasks/workOrderValidation/worktech.js'
        workOrderValidationTaskName =
          'inventoryScanner_workOrderValidation_worktech' satisfies TaskName
        break
      }
    }

    if (workOrderValidationTaskPath === '') {
      debug(
        `Work order validation not implemented: ${workOrderValidationSource}`
      )
    } else {
      // eslint-disable-next-line security/detect-object-injection
      childProcesses[workOrderValidationTaskName] = fork(
        workOrderValidationTaskPath
      )
    }
  }

  childProcesses.inventoryScanner_updateRecordsFromValidation = fork(
    './modules/inventoryScanner/tasks/updateRecordsFromValidation.task.js'
  )

  /*
   * FASTER Tasks
   */

  if (
    hasFasterApi &&
    getConfigProperty('modules.inventoryScanner.fasterItemRequests.isEnabled')
  ) {
    childProcesses.inventoryScanner_outstandingItemRequests = fork(
      './modules/inventoryScanner/tasks/outstandingItemRequests.task.js'
    )
  }

  childProcesses.inventoryScanner_downloadFasterMessageLog = fork(
    './modules/inventoryScanner/tasks/downloadFasterMessageLog.task.js'
  )

  debug(`"${moduleName}" initialized.`)

  return childProcesses
}
