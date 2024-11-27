import { DynamicsGP } from '@cityssm/dynamics-gp'
import { minutesToMillis } from '@cityssm/to-millis'
import camelCase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { getConfigProperty } from '../../../../helpers/functions.config.js'
import type { ConfigItemValidationDynamicsGP } from '../../configTypes.js'
import createOrUpdateItemValidation from '../../database/createOrUpdateItemValidation.js'
import deleteExpiredItemValidationRecords from '../../database/deleteExpiredItemValidationRecords.js'
import getMaxItemValidationRecordUpdateMillis from '../../database/getMaxItemValidationRecordUpdateMillis.js'
import { moduleName } from '../../helpers/module.js'

const minimumMillisBetweenRuns = minutesToMillis(50)
let lastRunMillis = getMaxItemValidationRecordUpdateMillis()

export const taskName = 'Inventory Validation Task - Dynamics GP'

const debug = Debug(
  `faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`
)

const itemNumberRegex = getConfigProperty(
  'modules.inventoryScanner.items.itemNumberRegex'
)

const taskConfig = getConfigProperty(
  'modules.inventoryScanner.items.validation'
) as ConfigItemValidationDynamicsGP

const dynamicsGpDatabaseConfig = getConfigProperty('dynamicsGP')

async function runUpdateItemValidationFromDynamicsGpTask(): Promise<void> {
  if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
    debug('Skipping run.')
    return
  }
   
  if (dynamicsGpDatabaseConfig === undefined) {
    debug('Missing configuration.')
    return
  }

  debug(`Running "${taskName}"...`)

  const timeMillis = Date.now()
  lastRunMillis = timeMillis

  const gpDatabase = new DynamicsGP(dynamicsGpDatabaseConfig)

  const items = await gpDatabase.getItemsByLocationCodes(
    Object.keys(taskConfig.gpLocationCodesToFasterStorerooms)
  )

  if (items.length > 0) {
    debug(`Syncing ${items.length} inventory items...`)

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
          itemNumber: item.itemNumber,
          itemDescription: item.itemDescription,
          availableQuantity: item.quantityOnHand,
          unitPrice: item.currentCost
        },
        timeMillis
      )
    }

    deleteExpiredItemValidationRecords(timeMillis)
  }

  debug(`Finished "${taskName}".`)
}

await runUpdateItemValidationFromDynamicsGpTask()

const job = schedule.scheduleJob(
  taskName,
  taskConfig.schedule ?? {
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    dayOfWeek: new schedule.Range(1, 5),
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    hour: new schedule.Range(4, 20),
    minute: 15,
    second: 0
  },
  runUpdateItemValidationFromDynamicsGpTask
)

exitHook(() => {
  try {
    job.cancel()
  } catch {}
})
