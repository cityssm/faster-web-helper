import { type ChildProcess, fork } from 'node:child_process'

import { isLocal } from '@cityssm/is-private-network-address'
import camelCase from 'camelcase'
import Debug from 'debug'
import type express from 'express'

import { DEBUG_NAMESPACE } from '../../debug.config.js'
import { getConfigProperty } from '../../helpers/config.helpers.js'
import { hasFasterApi } from '../../helpers/fasterWeb.helpers.js'
import type { TaskName } from '../../types/tasks.types.js'

import { initializeInventoryScannerDatabase } from './database/helpers.database.js'
import router from './handlers/router.js'
import scannerRouter from './handlers/router.scanner.js'
import { moduleName } from './helpers/module.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:${camelCase(moduleName)}`)

const urlPrefix = getConfigProperty('webServer.urlPrefix')

export function initializeInventoryScannerTasks(): Partial<
  Record<TaskName, ChildProcess>
> {
  initializeInventoryScannerDatabase()

  const childProcesses: Partial<Record<TaskName, ChildProcess>> = {}

  const itemValidationConfig = getConfigProperty(
    'modules.inventoryScanner.items.validation'
  )

  if (itemValidationConfig !== undefined) {
    let itemValidationTaskPath = ''
    let itemValidationTaskName = ''

    if (itemValidationConfig.source === 'dynamicsGP') {
      itemValidationTaskPath =
        './modules/inventoryScanner/tasks/itemValidation/dynamicsGp.js'
      itemValidationTaskName = 'inventoryScanner.itemValidation.dynamicsGp'
    } else {
      debug(`Item validation not implemented: ${itemValidationConfig.source}`)
    }

    if (itemValidationTaskPath !== '') {
      childProcesses[itemValidationTaskName] = fork(itemValidationTaskPath)
    }
  }

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
            'inventoryScanner.workOrderValidation.fasterApi'
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
          'inventoryScanner.workOrderValidation.worktech'
        break
      }
    }

    if (workOrderValidationTaskPath === '') {
      debug(
        `Work order validation not implemented: ${workOrderValidationSource}`
      )
    } else {
      childProcesses[workOrderValidationTaskName] = fork(
        workOrderValidationTaskPath
      )
    }
  }

  childProcesses['inventoryScanner.updateRecordsFromValidation'] = fork(
    './modules/inventoryScanner/tasks/updateRecordsFromValidation.js'
  )

  if (
    hasFasterApi &&
    getConfigProperty('modules.inventoryScanner.fasterItemRequests.isEnabled')
  ) {
    childProcesses['inventoryScanner.outstandingItemRequests'] = fork(
      './modules/inventoryScanner/tasks/outstandingItemRequests.js'
    )
  }

  return childProcesses
}

export function initializeInventoryScannerAppHandlers(
  app: express.Application
): void {
  /*
   * Initialize router for admin interface
   */

  app.use(
    `${urlPrefix}/modules/inventoryScanner`,
    (request, response, nextFunction) => {
      if (
        (request.session.user?.settings.inventoryScanner_hasAccess ??
          'false') === 'true'
      ) {
        nextFunction()
        return
      }

      response.redirect(`${urlPrefix}/dashboard`)
    },
    router
  )

  /*
   * Initialize router for scanner
   */

  app.use(
    `${urlPrefix}/apps/inventoryScanner`,
    (request, response, nextFunction) => {
      const requestIp = request.ip ?? ''

      const requestIpRegex = getConfigProperty(
        'modules.inventoryScanner.scannerIpAddressRegex'
      )

      if (isLocal(requestIp) || requestIpRegex.test(requestIp)) {
        nextFunction()
        return
      }

      response.json({
        error: 403,
        requestIp
      })
    },
    scannerRouter
  )
}
