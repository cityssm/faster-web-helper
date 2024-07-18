import camelCase from 'camelcase'
import Debug from 'debug'

import cleanupDatabase from '../database/cleanupDatabase.js'
import { moduleName } from '../helpers/moduleHelpers.js'

export const taskName = 'Cleanup Database Task'

const debug = Debug(
  `faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`
)

export default function runCleanupDatabaseTask(): void {
  debug(`Running "${taskName}"...`)

  const results = cleanupDatabase()

  if (
    results.returnToVendorRecords === 0 &&
    results.workOrderNumberMappings === 0
  ) {
    debug('No records deleted.')
  }

  if (results.returnToVendorRecords > 0) {
    debug(
      `${results.returnToVendorRecords} "Return to Vendor" records deleted.`
    )
  }

  if (results.workOrderNumberMappings > 0) {
    debug(
      `${results.workOrderNumberMappings} "Work Order Number Mappings" deleted.`
    )
  }

  debug(`Finished "${taskName}".`)
}
