import type { Application } from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'

import router from './handlers/router.js'

const urlPrefix = getConfigProperty('webServer.urlPrefix')

export default function initializeInventoryScannerAppHandlers(
  app: Application
): void {
  app.use(
    `${urlPrefix}/modules/integrityChecker`,
    (request, response, nextFunction) => {
      if (
        (request.session.user?.settings.integrityChecker_hasAccess ??
          'false') === 'true'
      ) {
        nextFunction()
        return
      }

      response.redirect(`${urlPrefix}/dashboard`)
    },
    router
  )
}
