// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable no-console */

import mssql from '@cityssm/mssql-multi-pool'

import { getConfigProperty } from '../helpers/config.helpers.js'
import {
  hasFasterApi,
  hasFasterUnofficialApi
} from '../helpers/fasterWeb.helpers.js'

function outputEnabledModules(): void {
  console.log()
  console.log('ENABLED MODULES')
  console.log('===============')

  console.log(
    `${getConfigProperty('modules.autocomplete.isEnabled') ? '🟢' : '🔴'} - autocomplete`
  )

  console.log(
    `${getConfigProperty('modules.integrityChecker.isEnabled') ? '🟢' : '🔴'} - integrityChecker`
  )

  console.log(
    `${getConfigProperty('modules.inventoryScanner.isEnabled') ? '🟢' : '🔴'} - inventoryScanner`
  )

  console.log(
    `${getConfigProperty('modules.tempFolderCleanup.isEnabled') ? '🟢' : '🔴'} - tempFolderCleanup`
  )
}

async function outputFasterApiStatus(): Promise<void> {
  const fasterWebConfig = getConfigProperty('fasterWeb')

  console.log()
  console.log('FASTER API STATUS')
  console.log('=================')

  console.log(`${hasFasterApi ? '🟢' : '🔴'} - FASTER API`)

  if (hasFasterApi) {
    const fasterApiImport = await import('@cityssm/faster-api')

    const fasterApi = new fasterApiImport.FasterApi(
      fasterWebConfig.tenantOrBaseUrl,
      fasterWebConfig.apiUserName ?? '',
      fasterWebConfig.apiPassword ?? ''
    )

    try {
      const apiHealth = await fasterApi.getHealthDiagnostics()

      console.log('\t🟢 - FASTER API is responding')

      console.log(
        `\t${apiHealth.success ? '🟢' : '🔴'} - FASTER API Health Check Success`
      )
    } catch {
      console.log('\t🔴 - FASTER API is not responding')
      return
    }
  }

  console.log(`${hasFasterUnofficialApi ? '🟢' : '🔴'} - FASTER Unofficial API`)
}

async function outputDatabaseStatuses(): Promise<void> {
  console.log()
  console.log('DATABASE STATUS')
  console.log('===============')

  // Dynamics GP

  const dynamicsGPConfig = getConfigProperty('dynamicsGP')
  
  if (dynamicsGPConfig === undefined) {
    console.log('🔴 - Dynamics GP database is not configured')
  } else {
    console.log('🟢 - Dynamics GP database is configured')

    const dynamicsGP = await mssql.connect(dynamicsGPConfig)

    try {
      await dynamicsGP.request().query('SELECT 1 AS status')

      console.log('\t🟢 - Dynamics GP API is responding')
    } catch {
      console.log('\t🔴 - Dynamics GP API is not responding')
    }
  }
  
  // Worktech

  const worktechConfig = getConfigProperty('worktech')

  if (worktechConfig === undefined) {
    console.log('🔴 - Worktech database is not configured')
  } else {
    console.log('🟢 - Worktech database is configured')

    const worktech = await mssql.connect(worktechConfig)

    try {
      await worktech.request().query('SELECT 1 AS status')

      console.log('\t🟢 - Worktech API is responding')
    } catch {
      console.log('\t🔴 - Worktech API is not responding')
    }
  }
}

outputEnabledModules()

await outputFasterApiStatus()

await outputDatabaseStatuses()

await mssql.releaseAll()
