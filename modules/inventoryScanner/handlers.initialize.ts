import { isLocal } from '@cityssm/is-private-network-address'
import type express from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'

import router from './handlers/router.js'
import scannerRouter from './handlers/router.scanner.js'

const urlPrefix = getConfigProperty('webServer.urlPrefix')

export default function initializeInventoryScannerAppHandlers(
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
