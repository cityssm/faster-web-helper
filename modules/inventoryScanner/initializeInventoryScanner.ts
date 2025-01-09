import { type ChildProcess, fork } from 'node:child_process'

import { isLocal } from '@cityssm/is-private-network-address'
import camelCase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import type express from 'express'

import { getConfigProperty } from '../../helpers/config.functions.js'
import { hasFasterApi } from '../../helpers/fasterWeb.helpers.js'

import { initializeInventoryScannerDatabase } from './database/helpers.database.js'
import router from './handlers/router.js'
import scannerRouter from './handlers/router.scanner.js'
import { moduleName } from './helpers/module.helpers.js'

const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`)

const urlPrefix = getConfigProperty('webServer.urlPrefix')


export function initializeInventoryScannerTasks(): void {
  initializeInventoryScannerDatabase()

  const childProcesses: ChildProcess[] = []

  const itemValidationConfig = getConfigProperty(
    'modules.inventoryScanner.items.validation'
  )

  if (itemValidationConfig !== undefined) {
    let itemValidationTaskPath = ''

    if (itemValidationConfig.source === 'dynamicsGP') {
      itemValidationTaskPath =
        './modules/inventoryScanner/tasks/itemValidation/dynamicsGp.js'
    } else {
      debug(`Item validation not implemented: ${itemValidationConfig.source}`)
    }

    if (itemValidationTaskPath !== '') {
      childProcesses.push(fork(itemValidationTaskPath))
    }
  }

  const workOrderValidationSources = getConfigProperty(
    'modules.inventoryScanner.workOrders.validationSources'
  )

  for (const workOrderValidationSource of workOrderValidationSources) {
    let workOrderValidationTaskPath = ''

    switch (workOrderValidationSource) {
      case 'fasterApi': {
        if (hasFasterApi) {
          workOrderValidationTaskPath =
            './modules/inventoryScanner/tasks/workOrderValidation/fasterApi.js'
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
        break
      }
    }

    if (workOrderValidationTaskPath === '') {
      debug(
        `Work order validation not implemented: ${workOrderValidationSource}`
      )
    } else {
      childProcesses.push(fork(workOrderValidationTaskPath))
    }
  }

  childProcesses.push(
    fork(
      './modules/inventoryScanner/tasks/inventoryScanner/updateRecordsFromValidation.js'
    )
  )

  if (hasFasterApi && getConfigProperty('modules.inventoryScanner.fasterItemRequests.isEnabled')) {
    childProcesses.push(
      fork('./modules/inventoryScanner/tasks/outstandingItemRequests.js')
    )
  }

  /*
   * Set up exit hook
   */

  exitHook(() => {
    for (const validationProcess of childProcesses) {
      validationProcess.kill()
    }
  })
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
