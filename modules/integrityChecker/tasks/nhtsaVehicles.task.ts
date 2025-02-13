import { ScheduledTask } from '@cityssm/scheduled-task'
import { DecodeVinValues } from '@shaggytools/nhtsa-api-wrapper'
import sqlite from 'better-sqlite3'
import camelcase from 'camelcase'
import Debug from 'debug'

import { DEBUG_NAMESPACE } from '../../../debug.config.js'
import { getConfigProperty } from '../../../helpers/config.helpers.js'
import {
  getMinimumMillisBetweenRuns,
  getScheduledTaskMinutes
} from '../../../helpers/tasks.helpers.js'
import createOrUpdateNhtsaVehicle from '../database/createOrUpdateNhtsaVehicle.js'
import getFasterAssetVinsToCheck from '../database/getFasterAssetVinsToCheck.js'
import { databasePath, timeoutMillis } from '../database/helpers.database.js'
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

export const taskName = 'Integrity Checker - NHTSA Vehicles'

const debug = Debug(
  `${DEBUG_NAMESPACE}:${camelcase(moduleName)}:${camelcase(taskName)}`
)

async function refreshNhtsaVehicles(): Promise<void> {
  const vinNumbersToCheck = getFasterAssetVinsToCheck()

  const database =
    vinNumbersToCheck.length > 0
      ? sqlite(databasePath, {
          timeout: timeoutMillis
        })
      : undefined

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
}

const scheduledTask = new ScheduledTask(taskName, refreshNhtsaVehicles, {
  schedule: {
    dayOfWeek: getConfigProperty('application.workDays'),
    hour: getConfigProperty('application.workHours'),
    minute: getScheduledTaskMinutes('integrityChecker_nhtsaVehicles'),
    second: 0
  },
  minimumIntervalMillis: getMinimumMillisBetweenRuns(
    'integrityChecker_nhtsaVehicles'
  ),
  startTask: true
})

process.on('message', (_message: unknown) => {
  debug('Received message.')
  void scheduledTask.runTask()
})
