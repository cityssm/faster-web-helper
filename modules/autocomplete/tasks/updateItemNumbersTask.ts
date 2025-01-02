import fs from 'node:fs/promises'

import { parseW200ExcelReport } from '@cityssm/faster-report-parser/xlsx'
import { dateStringToDate } from '@cityssm/utils-datetime'
import camelCase from 'camelcase'
import Debug from 'debug'

import { getConfigProperty } from '../../../helpers/config.functions.js'
import { downloadFilesToTemp } from '../../../helpers/sftp.functions.js'
import type {
  ConfigFileSuffixXlsx,
  ConfigScheduledFtpReport
} from '../../../types/configHelperTypes.js'
import { moduleName } from '../helpers/moduleHelpers.js'

export const taskName = 'Update Item Numbers Task'

const debug = Debug(
  `faster-web-helper:${camelCase(moduleName)}:${camelCase(taskName)}`
)

const inventoryConfig = getConfigProperty(
  'modules.autocomplete.reports.w200'
) as ConfigScheduledFtpReport<ConfigFileSuffixXlsx>

let maxInventoryDateMillis = 0

export default async function runUpdateItemNumbersTask(): Promise<void> {
  debug(`Running "${taskName}"...`)

  /*
   * Download files to temp
   */

  const tempInventoryReportFiles = await downloadFilesToTemp(
    inventoryConfig.ftpPath
  )

  /*
   * Loop through the files
   */

  for (const reportFile of tempInventoryReportFiles) {
    try {
      const report = parseW200ExcelReport(reportFile)

      const reportDateMillis = (
        dateStringToDate(report.exportDate, report.exportTime) as Date
      ).getTime()

      if (reportDateMillis < maxInventoryDateMillis) {
        continue
      }

      maxInventoryDateMillis = reportDateMillis

      const itemNumbers: string[] = []

      for (const storeroom of report.data) {
        for (const item of storeroom.items) {
          itemNumbers.push(item.itemNumber)
        }
      }

      await fs.writeFile(
        './public/autocomplete/itemNumbers.json',
        JSON.stringify({
          itemNumbers
        })
      )
    } catch (error) {
      debug(error)
    }
  }

  debug(`Finished "${taskName}".`)
}
