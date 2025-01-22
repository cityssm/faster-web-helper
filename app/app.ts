import path from 'node:path'

import FasterUrlBuilder from '@cityssm/faster-url-builder'
import cookieParser from 'cookie-parser'
import Debug from 'debug'
import express from 'express'
import session from 'express-session'
import createError from 'http-errors'
import FileStore from 'session-file-store'

import { initializeUserDatabase } from '../database/helpers.userDatabase.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'
import { sessionCheckHandler } from '../handlers/session.js'
import * as configHelpers from '../helpers/config.helpers.js'
import router_dashboard from '../routers/dashboard.js'
import router_login from '../routers/login.js'
import { version } from '../version.js'

const debug = Debug(`${DEBUG_NAMESPACE}:app:${process.pid}`)

/*
 * Initialize databases
 */

initializeUserDatabase()

/*
 * Initialize app
 */

export const app = express()

app.set('views', path.join('views'))
app.set('view engine', 'ejs')

app.use((request, _response, next) => {
  debug(`${request.method} ${request.url}`)
  next()
})

app.use(express.json())

app.use(
  express.urlencoded({
    extended: false
  })
)

app.use(cookieParser())

/*
 * Initialize static routes
 */

const urlPrefix = configHelpers.getConfigProperty('webServer.urlPrefix')

if (urlPrefix !== '') {
  debug(`urlPrefix = ${urlPrefix}`)
}

app.use(urlPrefix, express.static(path.join('public')))

app.use(
  `${urlPrefix}/lib/fa`,
  express.static(path.join('node_modules', '@fortawesome', 'fontawesome-free'))
)

app.use(
  `${urlPrefix}/lib/bulma`,
  express.static(path.join('node_modules', 'bulma', 'css'))
)

app.use(
  `${urlPrefix}/lib/cityssm-bulma-js`,
  express.static(path.join('node_modules', '@cityssm', 'bulma-js', 'dist'))
)

app.use(
  `${urlPrefix}/lib/cityssm-bulma-webapp-js`,
  express.static(
    path.join('node_modules', '@cityssm', 'bulma-webapp-js', 'dist')
  )
)

/*
 * SESSION MANAGEMENT
 */

const sessionCookieName = configHelpers.getConfigProperty(
  'webServer.session.cookieName'
)

const FileStoreSession = FileStore(session)

app.use(
  session({
    store: new FileStoreSession({
      path: './data/sessions',
      logFn: debug,
      retries: 20
    }),
    name: sessionCookieName,
    secret: configHelpers.getConfigProperty('webServer.session.secret'),
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: configHelpers.getConfigProperty('webServer.session.maxAgeMillis'),
      sameSite: 'strict'
    }
  })
)

// Clear cookie if no corresponding session
app.use((request, response, next) => {
  if (
    request.cookies[sessionCookieName] !== undefined &&
    request.session.user === undefined
  ) {
    response.clearCookie(sessionCookieName)
  }

  next()
})

/*
 * Initialize login / dashboard
 */

app.use((request, response, next) => {
  response.locals.user = request.session.user

  response.locals.configHelpers = configHelpers

  response.locals.fasterUrlBuilder = new FasterUrlBuilder(
    configHelpers.getConfigProperty('fasterWeb').tenantOrBaseUrl
  )

  response.locals.urlPrefix = configHelpers.getConfigProperty(
    'webServer.urlPrefix'
  )

  response.locals.version = version

  next()
})

app.get(`${urlPrefix}/`, sessionCheckHandler, (_request, response) => {
  response.redirect(`${urlPrefix}/dashboard`)
})

app.use(`${urlPrefix}/login`, router_login)

app.use(`${urlPrefix}/dashboard`, sessionCheckHandler, router_dashboard)

app.get(`${urlPrefix}/logout`, (request, response) => {
  if (
    request.session.user !== undefined &&
    request.cookies[sessionCookieName] !== undefined
  ) {
    request.session.destroy(() => {
      response.clearCookie(sessionCookieName)
      response.redirect(`${urlPrefix}/`)
    })
  } else {
    response.redirect(`${urlPrefix}/login`)
  }
})

/*
 * Initialize modules
 */

if (configHelpers.getConfigProperty('modules.autocomplete.isEnabled')) {
  const initializeAutocompleteModule = await import(
    '../modules/autocomplete/initializeAutocompleteModule.js'
  )
  initializeAutocompleteModule.initializeAutocompleteAppHandlers(app)
}

if (configHelpers.getConfigProperty('modules.inventoryScanner.isEnabled')) {
  const initializeInventoryScannerModule = await import(
    '../modules/inventoryScanner/handlers.initialize.js'
  )
  initializeInventoryScannerModule.default(app)
}

// eslint-disable-next-line no-secrets/no-secrets
if (configHelpers.getConfigProperty('modules.worktechIntegrity.isEnabled')) {
  const initializeWorktechIntegrityModule = await import(
    '../modules/worktechIntegrity/handlers.initialize.js'
  )
  initializeWorktechIntegrityModule.default(app)
}

/*
 * Error handling
 */

// Catch 404 and forward to error handler
app.use((_request, _response, next) => {
  next(createError(404))
})

// Error handler
app.use(
  (
    error: { status: number; message: string },
    request: express.Request,
    response: express.Response
  ) => {
    // Set locals, only providing error in development
    response.locals.message = error.message
    response.locals.error =
      request.app.get('env') === 'development' ? error : {}

    // Render the error page
    response.status(error.status || 500)
    response.render('error')
  }
)
