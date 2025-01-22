import { FasterApi } from '@cityssm/faster-api'
import { minutesToMillis } from '@cityssm/to-millis'
import { WorkTechAPI } from '@cityssm/worktech-api'
import { isValidVin } from '@shaggytools/nhtsa-api-wrapper'
import sqlite from 'better-sqlite3'
import camelCase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { DEBUG_NAMESPACE } from '../../../debug.config.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js'
import { getScheduledTaskMinutes } from '../../../helpers/tasks.helpers.js'
import { createOrUpdateFasterAsset } from '../database/createOrUpdateFasterAsset.js'
import { createOrUpdateWorktechEquipment } from '../database/createOrUpdateWorktechEquipment.js'
import { deleteExpiredRecords } from '../database/deleteExpiredRecords.js'
import getMaxFasterAssetUpdateMillis from '../database/getMaxFasterAssetUpdateMillis.js'
import { databasePath } from '../database/helpers.database.js'
import { moduleName } from '../helpers/module.helpers.js'

const minimumMillisBetweenRuns = minutesToMillis(45)

let lastRunMillis = getMaxFasterAssetUpdateMillis()

export const taskName = 'Active Equipment Task'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelCase(moduleName)}:${camelCase(taskName)}`
)

const fasterWebConfig = getConfigProperty('fasterWeb')
const worktechConfig = getConfigProperty('worktech')

async function refreshFasterAssets(): Promise<string[] | undefined> {
  if (
    fasterWebConfig.apiUserName === undefined ||
    fasterWebConfig.apiPassword === undefined
  ) {
    debug('Missing FASTER API user configuration.')
    return undefined
  }

  /*
   * Call FASTER API
   */

  const fasterApi = new FasterApi(
    fasterWebConfig.tenantOrBaseUrl,
    fasterWebConfig.apiUserName,
    fasterWebConfig.apiPassword
  )

  const fasterAssetsResponse = await fasterApi.getActiveAssets()

  if (!fasterAssetsResponse.success) {
    debug(`API Error: ${fasterAssetsResponse.error.title}`)
    return undefined
  }

  /*
   * Update the database
   */

  debug(
    `Updating ${fasterAssetsResponse.response.results.length} FASTER asset records...`
  )

  const database = sqlite(databasePath)
  const rightNow = Date.now()

  const assetNumbers: string[] = []

  for (const fasterAsset of fasterAssetsResponse.response.results) {

    const vinSerialIsValid = (isValidVin(fasterAsset.vinSerial) as boolean)

    const success = createOrUpdateFasterAsset(
      {
        assetNumber: fasterAsset.assetNumber,
        organization: fasterAsset.organization,
        vinSerial: fasterAsset.vinSerial,
        vinSerialIsValid: vinSerialIsValid ? 1 : 0,
        license: fasterAsset.license,
        year: fasterAsset.year,
        make: fasterAsset.make,
        model: fasterAsset.model,
        recordUpdate_timeMillis: rightNow
      },
      database
    )

    if (success) {
      assetNumbers.push(fasterAsset.assetNumber)
    }
  }

  /*
   * Delete expired assets
   */

  const deleteCount = deleteExpiredRecords('FasterAssets', rightNow, database)

  if (deleteCount > 0) {
    debug(`Deleted ${deleteCount} expired assets.`)
  }

  database.close()

  return assetNumbers
}

async function refreshWorktechEquipment(
  fasterAssetNumbers: string[]
): Promise<void> {
  if (worktechConfig === undefined) {
    debug('Missing Worktech configuration.')
    return
  }

  const database = sqlite(databasePath)

  const rightNow = Date.now()

  const worktech = new WorkTechAPI(worktechConfig)

  for (const assetNumber of fasterAssetNumbers) {
    const worktechEquipment =
      await worktech.getEquipmentByEquipmentId(assetNumber)

    if (worktechEquipment === undefined) {
      continue
    }

    createOrUpdateWorktechEquipment(
      {
        equipmentSystemId: worktechEquipment.equipmentSystemId,
        equipmentId: worktechEquipment.equipmentId,
        vinSerial: worktechEquipment.serialNumber,
        license: worktechEquipment.plate,
        year: worktechEquipment.equipmentModelYear,
        make: worktechEquipment.equipmentBrand,
        model: worktechEquipment.equipmentModel,
        recordUpdate_timeMillis: rightNow
      },
      database
    )
  }

  /*
   * Delete expired records
   */

  const deleteCount = deleteExpiredRecords(
    'WorktechEquipment',
    rightNow,
    database
  )

  if (deleteCount > 0) {
    debug(`Deleted ${deleteCount} expired Worktech equipment records.`)
  }

  database.close()
}

async function runEquipmentTask(): Promise<void> {
  if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
    debug('Skipping run.')
    return
  }

  debug(`Running "${taskName}"...`)

  const fasterAssetNumbers = await refreshFasterAssets()

  if (fasterAssetNumbers !== undefined) {
    await refreshWorktechEquipment(fasterAssetNumbers)
  }

  lastRunMillis = Date.now()

  debug(`Finished "${taskName}".`)
}

await runEquipmentTask()

const job = schedule.scheduleJob(
  taskName,
  {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('worktechIntegrity.equipment'),
    second: 0
  },
  runEquipmentTask
)

exitHook(() => {
  try {
    job.cancel()
  } catch {
    // ignore
  }
})
