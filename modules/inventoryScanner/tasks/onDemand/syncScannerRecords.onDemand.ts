import camelcase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'

import { DEBUG_NAMESPACE } from '../../../../debug.config.js'
import { getConfigProperty } from '../../../../helpers/config.helpers.js'
import { sendNtfyMessage } from '../../../../helpers/ntfy.helpers.js'
import type { TaskWorkerMessage } from '../../../../types/tasks.types.js'
import getScannerRecords from '../../database-issue/getScannerRecords.js'
import getSetting from '../../database/getSetting.js'
import updateSetting from '../../database/updateSetting.js'
import { syncScannerRecordsWithFaster } from '../../helpers/issueSync/fasterWeb.syncHelpers.js'
import { syncScannerRecordsWithWorktech } from '../../helpers/issueSync/worktech.syncHelpers.js'
import { moduleName } from '../../helpers/module.helpers.js'
import { sortScannerRecordsByWorkOrderType } from '../../helpers/workOrders.helpers.js'

export const taskName = 'Sync Scanner Records'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`
)

const ntfyTopic = getConfigProperty(
  'modules.inventoryScanner.fasterSync.ntfy.topic'
)

async function sendNtfySyncMessage(messagePiece: string): Promise<void> {
  if (
    getConfigProperty('modules.inventoryScanner.fasterSync.ntfy.isEnabled') &&
    ntfyTopic !== undefined
  ) {
    await sendNtfyMessage({
      message: `${taskName} - ${messagePiece}`,
      topic: ntfyTopic
    })
  }
}

async function syncScannerRecordsTask(): Promise<void> {
  debug(`Running "${taskName}"...`)

  const recordsToSyncList = getScannerRecords({
    isMarkedForSync: true
  })

  const recordsToSync = sortScannerRecordsByWorkOrderType(recordsToSyncList)

  for (const [workOrderType, records] of Object.entries(recordsToSync)) {
    switch (workOrderType) {
      case 'faster': {
        await syncScannerRecordsWithFaster(records)

        process.send?.({
          // eslint-disable-next-line no-secrets/no-secrets
          destinationTaskName: 'inventoryScanner_downloadFasterMessageLog',
          timeMillis: Date.now()
        } satisfies TaskWorkerMessage)

        break
      }
      case 'worktech': {
        await syncScannerRecordsWithWorktech(records)
        break
      }
    }
  }

  debug(`Finished "${taskName}", synced ${recordsToSyncList.length} record(s).`)
}

/*
 * Run the task if not already running.
 */

const isRunningSettingName = 'syncScannerRecords.isRunning'
const isRunning = getSetting(isRunningSettingName) ?? '0'

if (isRunning === '1') {
  debug(`"${taskName}" is already running, skipping...`)
} else {
  try {
    await sendNtfySyncMessage('Syncing scanner records...')

    // Mark the task as running
    updateSetting(isRunningSettingName, '1')

    await syncScannerRecordsTask()
  } catch (error) {
    debug(`Error in "${taskName}":`, error)

    await sendNtfySyncMessage('Sync finished with errors.')
  } finally {
    // Mark the task as not running
    updateSetting(isRunningSettingName, '0')

    debug(`"${taskName}" completed.`)

    await sendNtfySyncMessage('Sync finished.')
  }
}

exitHook(() => {
  debug(`Exiting "${taskName}"...`)

  // Ensure the task is marked as not running on exit
  updateSetting(isRunningSettingName, '0')
})