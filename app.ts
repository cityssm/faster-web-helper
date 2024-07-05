import Debug from 'debug'

import { getConfigProperty } from './helpers/functions.config.js'

const debug = Debug('faster-web-helper:app')

if (getConfigProperty('modules.inventoryScanner.isEnabled')) {
  debug('Initializing Inventory Scanner')
}
