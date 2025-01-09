import { FasterApi } from '@cityssm/faster-api'
import { WorkTechAPI } from '@cityssm/worktech-api'
import camelCase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { getConfigProperty } from '../../../helpers/config.functions.js'
import { getScheduledTaskMinutes } from '../../../helpers/tasks.functions.js'
import { getFasterAssetKey } from '../helpers/fasterFields.functions.js'
import { moduleName } from '../helpers/module.helpers.js'
import {
  getWorktechEquipmentClass,
  getWorktechEquipmentDepartment,
  getWorktechEquipmentDescription,
  getWorktechEquipmentId
} from '../helpers/worktechMappings.functions.js'

export const taskName = 'Active Equipment Task'

const debug = Debug(
  `faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`
)

const fasterWebConfig = getConfigProperty('fasterWeb')
const worktechConfig = getConfigProperty('worktech')

async function runActiveEquipmentTask(): Promise<void> {
  if (
    fasterWebConfig.apiUserName === undefined ||
    fasterWebConfig.apiPassword === undefined
  ) {
    debug('Missing FASTER API user configuration.')
    return
  }

  if (worktechConfig === undefined) {
    debug('Missing Worktech configuration.')
    return
  }

  debug(`Running "${taskName}"...`)

  const worktech = new WorkTechAPI(worktechConfig)

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
    return
  }

  debug(`Syncing ${fasterAssetsResponse.response.results.length} asset(s)...`)

  for (const fasterAsset of fasterAssetsResponse.response.results) {
    /*
     * Get Worktech equipment record
     */

    const worktechEquipmentId = getWorktechEquipmentId(fasterAsset)

    const worktechEquipment =
      await worktech.getEquipmentByEquipmentId(worktechEquipmentId)

    // Add equipment if it doesn't exist
    if (worktechEquipment === undefined) {
      debug(`Adding equipment: ${worktechEquipmentId}`)

      const worktechEquipmentDescription =
        getWorktechEquipmentDescription(fasterAsset)

      const worktechEquipmentClass = getWorktechEquipmentClass(fasterAsset)

      const worktechEquipmentDepartment =
        getWorktechEquipmentDepartment(fasterAsset)

      const worktechEquipmentComment = getFasterAssetKey(fasterAsset)

      const worktechSystemId = await worktech.addEquipment({
        equipmentId: worktechEquipmentId,
        equipmentClass: worktechEquipmentClass,
        equipmentDescription: worktechEquipmentDescription,
        equipmentBrand: fasterAsset.make,
        equipmentModel: fasterAsset.model,
        equipmentModelYear: fasterAsset.year,
        departmentOwned: worktechEquipmentDepartment,
        serialNumber: fasterAsset.vinSerial,
        plate: fasterAsset.licence,
        comments: worktechEquipmentComment
      })

      debug(`Added equipment: ${worktechSystemId}`)

      continue
    }

    // Update equipment if it exists

    debug(`Updating equipment: ${worktechEquipmentId}`)

    // eslint-disable-next-line no-secrets/no-secrets
    /*
    const fieldsToUpdate = getWorktechEquipmentFieldsToUpdate(
      fasterAsset,
      worktechEquipment
    )
    */
  }

  debug(`Finished "${taskName}".`)
}

await runActiveEquipmentTask()

const job = schedule.scheduleJob(
  taskName,
  {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('worktechUpdate.activeEquipment'),
    second: 0
  },
  runActiveEquipmentTask
)

exitHook(() => {
  try {
    job.cancel()
  } catch {
    // ignore
  }
})
