import { DecodeVinValues } from '@shaggytools/nhtsa-api-wrapper'
import { Sema } from 'async-sema'
import sqlite from 'better-sqlite3'
import camelcase from 'camelcase'
import Debug from 'debug'
import exitHook from 'exit-hook'
import schedule from 'node-schedule'

import { DEBUG_NAMESPACE } from '../../../debug.config.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js'
import {
  getMinimumMillisBetweenRuns,
  getScheduledTaskMinutes
} from '../../../helpers/tasks.helpers.js'
import type { TaskWorkerMessage } from '../../../types/tasks.types.js'
import createOrUpdateNhtsaVehicle from '../database/createOrUpdateNhtsaVehicle.js'
import getFasterAssetVinsToCheck from '../database/getFasterAssetVinsToCheck.js'
import { databasePath } from '../database/helpers.database.js'
import { moduleName } from '../helpers/module.helpers.js'

interface DecodeVinValuesResponse {
  Count: number
  Message: string
  SearchCriteria: string
  Results: Array<Record<string, string>>
}

const variableKeys = {
  SuggestedVIN: 'SuggestedVIN',
  Make: 'Make',
  Model: 'Model',
  ModelYear: 'ModelYear',
  ErrorCode: 'ErrorCode',
  ErrorText: 'ErrorText'
}

const minimumMillisBetweenRuns = getMinimumMillisBetweenRuns(
  'integrityChecker.nhtsaVehicles'
)

export const taskName = 'NHTSA Vehicles Task'
let lastRunMillis = 0
const semaphore = new Sema(1)

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`
)

async function _refreshNhtsaVehicles(): Promise<void> {
  if (lastRunMillis + minimumMillisBetweenRuns > Date.now()) {
    debug('Skipping run.')
    return
  }

  debug(`Running "${taskName}"...`)

  const vinNumbersToCheck = getFasterAssetVinsToCheck()

  const database =
    vinNumbersToCheck.length > 0 ? sqlite(databasePath) : undefined

  for (const vinNumberToCheck of vinNumbersToCheck) {
    const decodedVin = (await DecodeVinValues(vinNumberToCheck.vinSerial, {
      modelYear: vinNumberToCheck.year
    })) as DecodeVinValuesResponse

    const decodedVinValues = decodedVin.Results[0]

    createOrUpdateNhtsaVehicle(
      {
        vin: vinNumberToCheck.vinSerial,
        suggestedVin: decodedVinValues[variableKeys.SuggestedVIN],
        make: decodedVinValues[variableKeys.Make],
        model: decodedVinValues[variableKeys.Model],
        year:
          decodedVinValues[variableKeys.ModelYear] === ''
            ? undefined
            : Number.parseInt(decodedVinValues[variableKeys.ModelYear], 10),
        errorCode: decodedVinValues[variableKeys.ErrorCode],
        errorText: decodedVinValues[variableKeys.ErrorText],
        recordUpdate_timeMillis: Date.now()
      },
      database as sqlite.Database
    )
  }

  if (database !== undefined) {
    database.close()
  }

  lastRunMillis = Date.now()

  debug(`"${taskName}" complete.`)
}

async function refreshNhtsaVehicles(): Promise<void> {
  await semaphore.acquire()

  try {
    await _refreshNhtsaVehicles()
  } finally {
    semaphore.release()
  }
}

const job = schedule.scheduleJob(
  taskName,
  {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('integrityChecker.nhtsaVehicles'),
    second: 0
  },
  refreshNhtsaVehicles
)

exitHook(() => {
  try {
    job.cancel()
  } catch {
    // ignore
  }
})

process.on('message', (_message: TaskWorkerMessage) => {
  debug('Received message.')
  void refreshNhtsaVehicles()
})
