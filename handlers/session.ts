import type { NextFunction, Request, Response } from 'express'

import { getConfigProperty } from '../helpers/functions.config.js'

const urlPrefix = getConfigProperty('webServer.urlPrefix')

const sessionCookieName = getConfigProperty('webServer.session.cookieName')

// Redirect logged in users
export function sessionCheckHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (
    request.session.user !== undefined &&
    request.cookies[sessionCookieName] !== undefined
  ) {
    next()
    return
  }

  response.redirect(`${urlPrefix}/login?redirect=${request.originalUrl}`)
}
