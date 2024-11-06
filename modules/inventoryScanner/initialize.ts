import { isLocal } from '@cityssm/is-private-network-address'
import camelCase from 'camelcase'
import Debug from 'debug'

import { getConfigProperty } from '../../helpers/functions.config.js'
import type { ModuleInitializerOptions } from '../types.js'

import { initializeInventoryScannerDatabase } from './database/helpers.database.js'
import router from './handlers/router.js'
import scannerRouter from './handlers/router.scanner.js'
import { moduleName } from './helpers/module.js'

const debug = Debug(`faster-web-helper:${camelCase(moduleName)}`)

const urlPrefix = getConfigProperty('webServer.urlPrefix')

export default function initializeInventoryScannerModules(
  options: ModuleInitializerOptions
): void {
  debug(`Initializing "${moduleName}"...`)

  /*
   * Ensure the local database is available.
   */

  initializeInventoryScannerDatabase()

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

  debug(`"${moduleName}" initialized.`)
}
