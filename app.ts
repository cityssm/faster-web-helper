import http from 'node:http'

import Debug from 'debug'
import { asyncExitHook } from 'exit-hook'
import express from 'express'
import schedule from 'node-schedule'

import { getConfigProperty } from './helpers/functions.config.js'
import initializeAutocompleteModule from './modules/autocomplete/initializeAutocompleteModule.js'
import initializeTempFolderCleanupModule from './modules/tempFolderCleanup/initializeTempFolderCleanupModule.js'
import initializeWorktechUpdateModule from './modules/worktechUpdate/initializeWorktechUpdateModule.js'

const debug = Debug('faster-web-helper:app')

/*
 * Initialize app
 */

const app = express()

/*
 * Initialize modules
 */

if (getConfigProperty('modules.autocomplete.isEnabled')) {
  await initializeAutocompleteModule(app)
}

if (getConfigProperty('modules.inventoryScanner.isEnabled')) {
  debug('Initializing Inventory Scanner')
}

if (getConfigProperty('modules.worktechUpdate.isEnabled')) {
  await initializeWorktechUpdateModule()
}

if (getConfigProperty('modules.tempFolderCleanup.isEnabled')) {
  await initializeTempFolderCleanupModule()
}

/*
 * Initialize server
 */

const httpPort = getConfigProperty('webServer.httpPort')
const httpServer = http.createServer(app)

httpServer.listen(httpPort)
debug(`HTTP listening on ${httpPort.toString()}`)

asyncExitHook(
  async () => {
    await schedule.gracefulShutdown()
    httpServer.close()
  },
  {
    wait: 1000
  }
)
