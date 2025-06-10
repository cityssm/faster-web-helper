import { DynamicsGP } from '@cityssm/dynamics-gp'
import { ScheduledTask } from '@cityssm/scheduled-task'
import camelCase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../../../debug.config.js'
import { getConfigProperty } from '../../../../helpers/config.helpers.js'
import {
  getMinimumMillisBetweenRuns,
  getScheduledTaskMinutes
} from '../../../../helpers/tasks.helpers.js'
import type { ConfigItemValidationDynamicsGP } from '../../config/types.js'
import createOrUpdateItemValidation from '../../database/createOrUpdateItemValidation.js'
import deleteExpiredItemValidationRecords from '../../database/deleteExpiredItemValidationRecords.js'
import getMaxItemValidationRecordUpdateMillis from '../../database/getMaxItemValidationRecordUpdateMillis.js'
import { moduleName } from '../../helpers/module.helpers.js'

export const taskName = 'Inventory Validation - Dynamics GP'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`
)

const itemNumberRegex = getConfigProperty(
  'modules.inventoryScanner.items.itemNumberRegex'
)

const taskConfig = getConfigProperty(
  'modules.inventoryScanner.items.validation'
) as ConfigItemValidationDynamicsGP

const dynamicsGpDatabaseConfig = getConfigProperty('dynamicsGP')

async function runUpdateItemValidationFromDynamicsGp(): Promise<void> {
  if (dynamicsGpDatabaseConfig === undefined) {
    debug('Missing configuration.')
    return
  }

  const timeMillis = Date.now()

  const gpDatabase = new DynamicsGP(dynamicsGpDatabaseConfig)

  const items = await gpDatabase.getItemsByLocationCodes(
    Object.keys(taskConfig.gpLocationCodesToFasterStorerooms)
  )

  if (items.length > 0) {
    debug(`Caching ${items.length} Dynamics GP inventory items...`)

    for (const item of items) {
      // Skip records with invalid item numbers
      if (
        itemNumberRegex !== undefined &&
        !itemNumberRegex.test(item.itemNumber)
      ) {
        continue
      }

      // Skip records filtered for other reasons
      if (
        taskConfig.gpItemFilter !== undefined &&
        !taskConfig.gpItemFilter(item)
      ) {
        continue
      }

      const itemStoreroom =
        taskConfig.gpLocationCodesToFasterStorerooms[item.locationCode] ?? ''

      createOrUpdateItemValidation(
        {
          itemStoreroom,

          itemNumberPrefix: '',
          itemNumber: item.itemNumber,

          itemDescription: item.itemDescription,
          
          availableQuantity: item.quantityOnHand,
          unitPrice: item.currentCost,

          rawJsonData: JSON.stringify(item)
        },
        timeMillis
      )
    }

    deleteExpiredItemValidationRecords(timeMillis)
  }

  debug(`Finished "${taskName}".`)
}

const scheduledTask = new ScheduledTask(
  taskName,
  runUpdateItemValidationFromDynamicsGp,
  {
    schedule: {
      dayOfWeek: getConfigProperty('application.workDays'),
      hour: getConfigProperty('application.workHours'),
      minute: getScheduledTaskMinutes(
        'inventoryScanner_itemValidation_dynamicsGp'
      ),
      second: 0
    },
    lastRunMillis: getMaxItemValidationRecordUpdateMillis(''),
    minimumIntervalMillis: getMinimumMillisBetweenRuns(
      'inventoryScanner_itemValidation_dynamicsGp'
    ),
    startTask: true
  }
)

await scheduledTask.runTask()
