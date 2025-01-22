import type express from 'express'

import { getConfigProperty } from '../../helpers/config.helpers.js'

import router from './handlers/router.js'

const urlPrefix = getConfigProperty('webServer.urlPrefix')

export default function initializeInventoryScannerAppHandlers(
  app: express.Application
): void {
  app.use(
    `${urlPrefix}/modules/worktechIntegrity`,
    (request, response, nextFunction) => {
      if (
        (request.session.user?.settings.worktechIntegrity_hasAccess ??
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
