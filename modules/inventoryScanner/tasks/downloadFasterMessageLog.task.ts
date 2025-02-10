import { extractInventoryImportErrors } from '@cityssm/faster-report-parser/advanced'
import { FasterUnofficialAPI } from '@cityssm/faster-unofficial-api'
import { ScheduledTask } from '@cityssm/scheduled-task'
import sqlite from 'better-sqlite3'
import camelcase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../../debug.config.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js'
import { hasFasterUnofficialApi } from '../../../helpers/fasterWeb.helpers.js'
import createSyncErrorLogRecord from '../database/createSyncErrorLogRecord.js'
import getLatestSyncErrorLog from '../database/getLatestSyncErrorLog.js'
import getScannerRecords from '../database/getScannerRecords.js'
import { databasePath } from '../database/helpers.database.js'
import { updateScannerRecordSyncFields } from '../database/updateScannerRecordSyncFields.js'
import { moduleName } from '../helpers/module.helpers.js'
import type { InventoryScannerRecord } from '../types.js'

export const taskName = 'Download FASTER Message Log Task'
export const taskUser = 'faster.w603'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`
)

const fasterWebConfig = getConfigProperty('fasterWeb')

async function downloadFasterMessageLog(): Promise<void> {
  if (!hasFasterUnofficialApi) {
    debug('Missing user configuration.')
    return
  }

  /*
   * Get the message log errors from the past seven days
   */

  const fasterApi = new FasterUnofficialAPI(
    fasterWebConfig.tenantOrBaseUrl,
    fasterWebConfig.appUserName ?? '',
    fasterWebConfig.appPassword ?? ''
  )

  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 7)

  const messageLogErrors = await fasterApi.getMessageLog(sevenDaysAgo, today)

  if (messageLogErrors.length === 0) {
    debug('No message log errors in the past seven days.')
    return
  }

  const iiuErrors = extractInventoryImportErrors(messageLogErrors)

  if (iiuErrors.length === 0) {
    debug('No IIU log errors identified in the past seven days.')
    return
  }

  /*
   * Get the last recorded log id
   */

  const database = sqlite(databasePath)

  const latestLogEntry = getLatestSyncErrorLog('faster', database)

  const lastRecordedLogId =
    latestLogEntry === undefined ? 0 : Number.parseInt(latestLogEntry.logId)

  /*
   * Loop through the message log errors
   */

  let errorsRecords = 0

  const scannerRecordsCache = new Map<string, InventoryScannerRecord[]>()

  for (const iiuError of iiuErrors) {
    if (
      iiuError.messageId <= lastRecordedLogId ||
      !iiuError.message.startsWith('Error: ')
    ) {
      continue
    } else if (iiuError.fileName === undefined) {
      createSyncErrorLogRecord({
        workOrderType: 'faster',
        logId: iiuError.messageId.toString(),
        logDate: new Date(iiuError.messageDateTime),
        logMessage: iiuError.message,
        recordCreate_userName: taskUser
      })

      errorsRecords += 1
    } else {
      /*
       * Get the scanner records
       */

      let scannerRecords = scannerRecordsCache.get(iiuError.fileName)

      if (scannerRecords === undefined) {
        scannerRecords = getScannerRecords(
          {
            isSynced: true,
            isSyncedSuccessfully: true,
            syncedRecordId: iiuError.fileName
          },
          {},
          database
        )
        scannerRecordsCache.set(iiuError.fileName, scannerRecords)
      }

      /*
       * Attempt to find a matching scanner record
       */

      const matchingScannerRecord = scannerRecords.find((possibleMatch) => {
        const itemNumber =
          (possibleMatch.itemNumberPrefix === ''
            ? ''
            : `${possibleMatch.itemNumberPrefix}-`) + possibleMatch.itemNumber

        return (
          // Invoice Number - Left padded with Xs
          iiuError.message.includes(`${possibleMatch.recordId},`) &&
          iiuError.message.includes(`,${possibleMatch.quantity},`) &&
          iiuError.message.includes(`,${itemNumber},`) &&
          // Repair ID - Includes a space ahead of it
          iiuError.message.includes(`${possibleMatch.repairId},`) &&
          // Work Order Number - Last item, no following comma
          iiuError.message.includes(`,${possibleMatch.workOrderNumber}`)
        )
      })

      createSyncErrorLogRecord({
        workOrderType: 'faster',
        logId: iiuError.messageId.toString(),
        logDate: new Date(iiuError.messageDateTime),
        logMessage: iiuError.message,
        scannerSyncedRecordId: iiuError.fileName,
        scannerRecordId: matchingScannerRecord?.recordId,
        recordCreate_userName: taskUser
      })

      errorsRecords += 1

      if (matchingScannerRecord !== undefined) {
        updateScannerRecordSyncFields(
          {
            recordId: matchingScannerRecord.recordId,
            isSuccessful: false,
            syncedRecordId:
              matchingScannerRecord.recordSync_syncedRecordId ??
              iiuError.fileName,
            message: iiuError.message
          },
          database
        )
      }
    }
  }

  database.close()

  debug(`Recorded ${errorsRecords} IIU log errors.`)
}

const scheduledTask = new ScheduledTask(taskName, downloadFasterMessageLog, {
  schedule: {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours').at(-1),
    minute: 59,
    second: 59
  },
  startTask: true
})

/*
 * Listen for messages
 */

process.on('message', (_message: unknown) => {
  void scheduledTask.runTask()
})

/*
 * Run the task on initialization
 */

void scheduledTask.runTask()
