import { isLocal } from '@cityssm/is-private-network-address'
import camelCase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { getConfigProperty } from '../../helpers/functions.config.js'
import type { DefaultAsyncTaskExport } from '../../types/taskTypes.js'
import type { ModuleInitializerOptions } from '../types.js'

import { initializeInventoryScannerDatabase } from './database/helpers.database.js'
import router from './handlers/router.js'
import scannerRouter from './handlers/router.scanner.js'
import { moduleName } from './helpers/module.js'

const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`)

const urlPrefix = getConfigProperty('webServer.urlPrefix')

export default async function initializeInventoryScannerModules(
  options: ModuleInitializerOptions
): Promise<void> {
  debug(`Initializing "${moduleName}"...`)

  /*
   * Ensure the local database is available.
   */

  initializeInventoryScannerDatabase()

  /*
   * Initialize validation tasks
   */

  let itemValidationJob: schedule.Job | undefined
  const itemValidationConfig = getConfigProperty(
    'modules.inventoryScanner.items.validation'
  )

  if (itemValidationConfig !== undefined) {
    let itemValidationTask: DefaultAsyncTaskExport | undefined

    if (itemValidationConfig.source === 'dynamicsGP') {
      const importedTask = await import('./tasks/itemValidation/dynamicsGp.js')
      itemValidationTask = importedTask.default

      debug(`Running  "${itemValidationTask.taskName}" on startup...`)
      await itemValidationTask.task()
    } else {
      debug(`Item validation not implemented: ${itemValidationConfig.source}`)
    }

    if (itemValidationTask !== undefined) {
      itemValidationJob = schedule.scheduleJob(
        itemValidationTask.taskName,
        itemValidationTask.schedule,
        itemValidationTask.task
      )
    }
  }

  /*
   * Initialize router for admin interface
   */

  options.app.use(
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

  options.app.use(
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

  /*
   * Set up exit hook
   */

  exitHook(() => {
    if (itemValidationJob !== undefined) {
      itemValidationJob.cancel()
    }
  })

  debug(`"${moduleName}" initialized.`)
}
