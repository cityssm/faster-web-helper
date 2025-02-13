// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-secrets/no-secrets */

import { DynamicsGP } from '@cityssm/dynamics-gp'
import type sqlite from 'better-sqlite3'
import camelCase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../../../debug.config.js'
import { getConfigProperty } from '../../../../helpers/config.helpers.js'
import { createOrUpdateDynamicsGpInventoryItem } from '../../database/createOrUpdateDynamicsGpInventoryItem.js'
import { deleteExpiredRecords } from '../../database/deleteExpiredRecords.js'
import { moduleName } from '../../helpers/module.helpers.js'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelCase(moduleName)}:inventoryValidation:dynamicsGp`
)

const dynamicsGPConfig = getConfigProperty('dynamicsGP')

const gpLocationCodesToFasterStorerooms = getConfigProperty(
  'modules.integrityChecker.fasterInventory.validation.gpLocationCodesToFasterStorerooms'
)

const gpItemFilter = getConfigProperty(
  'modules.integrityChecker.fasterInventory.validation.gpItemFilter'
)


export async function refreshDynamicsGpInventory(database: sqlite.Database): Promise<void> {
  if (dynamicsGPConfig === undefined) {
    debug('Missing Dynamics GP configuration.')
    return
  }

  /*
   * Call Dynamics GP API
   */

  const dynamicsGp = new DynamicsGP(dynamicsGPConfig)

  const dynamicsGpLocationCodes = Object.keys(gpLocationCodesToFasterStorerooms)
  const inventory = await dynamicsGp.getItemsByLocationCodes(
    dynamicsGpLocationCodes
  )

  /*
   * Update the database
   */

  debug(`Updating ${inventory.length} Dynamics GP inventory records...`)

  const rightNowMillis = Date.now()

  for (const item of inventory) {
    if (gpItemFilter?.(item) ?? true) {
      createOrUpdateDynamicsGpInventoryItem(
        {
          itemNumber: item.itemNumber,
          locationCode: item.locationCode,
          fasterStoreroom: gpLocationCodesToFasterStorerooms[item.locationCode],

          itemDescription: item.itemDescription,
          itemShortName: item.itemShortName,
          itemType: item.itemType,

          binNumber: item.binNumber,
          currentCost: item.currentCost,
          quantityOnHand: item.quantityOnHand,

          recordUpdate_timeMillis: rightNowMillis
        },
        database
      )
    }
  }

  /*
   * Delete expired assets
   */

  const deleteCount = deleteExpiredRecords(
    'DynamicsGpInventoryItems',
    rightNowMillis,
    database
  )

  if (deleteCount > 0) {
    debug(`Deleted ${deleteCount} expired items.`)
  }
}
